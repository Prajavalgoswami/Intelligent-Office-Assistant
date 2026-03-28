import base64
from datetime import datetime
from email.utils import parsedate_to_datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth.dependencies import get_current_user, require_employee
from app.auth.password import verify_password, hash_password
from app.core.database import user_collection, gmail_labels_collection, email_collection
from app.services.gmail_service import GmailService
from app.services.ai_classifier import classify_email
from app.utils.username import normalize_username

from ..auth.google_auth import verify_google_token
from ..auth.jwt import create_employee_token
from ..services.employee import resolve_roles

router = APIRouter(prefix="/auth", tags=["Employee"])

class GoogleLoginRequest(BaseModel):
    id_token: str

class UserIdPasswordLogin(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)


class ChangeUsernameRequest(BaseModel):
    current_password: str
    new_username: str = Field(..., min_length=3, max_length=32)

@router.post("/employee/google-login")
async def employee_google_login(request: GoogleLoginRequest):
    google_payload = verify_google_token(request.id_token)
    if not google_payload or not (email := google_payload.get("email")):
        raise HTTPException(401, "Invalid Google token")
    local, domain = email.split("@", 1)
    local = local.split("+", 1)[0]
    pattern = f"^{local}(\\+.*)?@{domain}$"

    user = await user_collection.find_one({
        "email": {"$regex": pattern, "$options": "i"}
    })
    if not user:
        raise HTTPException(403, "No active account found")

    user_id = str(user["_id"])
    company_id = user["company_id"]

    role_data = await resolve_roles(user_id)
    if not role_data:
        raise HTTPException(403, "No roles assigned")

    access_token = create_employee_token(
        user_id=user_id,
        company_id=company_id,
        department_id=user.get("department_id") or "",
        role_names=role_data["roles"],
        priority=role_data["max_priority"],
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login/username-password")
async def login_with_username_and_password(request: UserIdPasswordLogin):
    raw = (request.username or "").strip()
    user = None

    # Legacy: login with user_<ObjectId>
    if raw.lower().startswith("user_"):
        try:
            oid_str = raw[5:]
            user_oid = ObjectId(oid_str)
            user = await user_collection.find_one({"_id": user_oid, "status": "active"})
        except Exception:
            user = None

    if not user:
        try:
            uname = normalize_username(raw)
        except ValueError:
            raise HTTPException(401, "Invalid username or password")
        user = await user_collection.find_one({"username": uname, "status": "active"})

    if not user or not verify_password(request.password, user.get("password")):
        raise HTTPException(401, "Invalid username or password")

    user_id = str(user["_id"])
    company_id = user["company_id"]
    role_data = await resolve_roles(user_id)
    if not role_data:
        raise HTTPException(403, "No roles assigned")

    access_token = create_employee_token(
        user_id=user_id,
        company_id=company_id,
        department_id=user.get("department_id") or "",
        role_names=role_data["roles"],
        priority=role_data["max_priority"]
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user=Depends(get_current_user),
):
    uid = current_user["user_id"]
    user = await user_collection.find_one({"_id": ObjectId(uid)})
    if not user or not user.get("password"):
        raise HTTPException(
            status_code=400,
            detail="Password change is not available for this account",
        )
    if not verify_password(payload.old_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    await user_collection.update_one(
        {"_id": ObjectId(uid)},
        {"$set": {"password": hash_password(payload.new_password)}},
    )
    return {"message": "Password updated successfully"}


@router.post("/change-username")
async def change_username(
    payload: ChangeUsernameRequest,
    current_user=Depends(get_current_user),
):
    uid = current_user["user_id"]
    user = await user_collection.find_one({"_id": ObjectId(uid)})
    if not user or not user.get("password"):
        raise HTTPException(
            status_code=400,
            detail="Username change is not available for this account",
        )
    if not verify_password(payload.current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    try:
        new_uname = normalize_username(payload.new_username)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    current_uname = user.get("username")
    if current_uname == new_uname:
        raise HTTPException(status_code=400, detail="That is already your username")

    taken = await user_collection.find_one(
        {"username": new_uname, "_id": {"$ne": ObjectId(uid)}}
    )
    if taken:
        raise HTTPException(status_code=400, detail="Username is already taken")

    await user_collection.update_one(
        {"_id": ObjectId(uid)},
        {"$set": {"username": new_uname}},
    )
    return {"message": "Username updated successfully", "username": new_uname}

@router.get("/company-users")
async def get_company_users(current_user=Depends(get_current_user)):
    """List users in the same company (for adding to chat groups)."""
    company_id = current_user.get("company_id")
    if not company_id:
        return []

    cursor = user_collection.find(
        {"company_id": company_id, "status": "active"},
        {"_id": 1, "email": 1, "name": 1, "username": 1}
    ).limit(200)

    users = []
    async for u in cursor:
        uid = str(u["_id"])
        name = u.get("name", "")
        email = u.get("email", "")
        display = name or email or uid
        users.append({
            "user_id": uid,
            "email": email,
            "name": name,
            "username": u.get("username"),
            "display": display,
        })
    return users


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    """
    Return the current employee profile, including display name and email,
    for use in the UI (profile header, chat, etc.).
    """
    user_doc = None
    try:
        user_doc = await user_collection.find_one(
            {"_id": ObjectId(current_user["user_id"])},
            {"name": 1, "email": 1, "username": 1},
        )
    except Exception:
        user_doc = None

    return {
        "user_id": current_user["user_id"],
        "company_id": current_user.get("company_id"),
        "department_id": current_user.get("department_id"),
        "type": current_user.get("type"),
        "roles": current_user.get("roles", []),
        "priority": current_user.get("priority"),
        "name": user_doc.get("name") if user_doc else None,
        "email": user_doc.get("email") if user_doc else None,
        "username": user_doc.get("username") if user_doc else None,
    }

from fastapi import Depends, APIRouter
from app.services.gmail_service import GmailService
from app.auth.dependencies import get_current_user
from app.models.user import User

from fastapi import Depends
from app.services.gmail_service import GmailService
from app.auth.dependencies import get_current_user,require_employee
from app.core.database import user_collection
from app.core.database import user_collection, gmail_labels_collection

@router.get("/gmail/test")
async def test_gmail(admin=Depends(require_employee)):

    user = await user_collection.find_one(
        {"_id": ObjectId(admin["user_id"])}
    )

    if not user:
        return {"error": "User not found in database"}

    gmail_service = GmailService(user)
    service = await gmail_service.create_service()

    profile = service.users().getProfile(userId="me").execute()

    return {
        "email": profile["emailAddress"],
        "total_messages": profile["messagesTotal"],
        "total_threads": profile["threadsTotal"],
    }


@router.get("/gmail/messages")
async def fetch_latest_message_ids(
    admin=Depends(require_employee)
):
    # 1️⃣ Get user from DB
    user = await user_collection.find_one(
        {"_id": ObjectId(admin["user_id"])}
    )

    if not user:
        return {"error": "User not found"}

    # 2️⃣ Create Gmail service
    gmail_service = GmailService(user)
    service = await gmail_service.create_service()

    # 3️⃣ Fetch latest 20 message IDs
    results = service.users().messages().list(
        userId="me",
        maxResults=20
    ).execute()

    messages = results.get("messages", [])

    # 4️⃣ Extract only IDs
    message_ids = [msg["id"] for msg in messages]

    return {
        "total_fetched": len(message_ids),
        "message_ids": message_ids
    }


@router.get("/gmail/full-messages")
async def fetch_full_email_details(
    admin=Depends(require_employee)
):
    from app.services.gmail_service import GmailService
    from app.core.database import user_collection, gmail_labels_collection
    from app.services.ai_classifier import classify_email

    # 1️⃣ Get user
    user = await user_collection.find_one(
        {"_id": ObjectId(admin["user_id"])}
    )

    if not user:
        return {"error": "User not found"}

    # 2️⃣ Create Gmail service
    gmail_service = GmailService(user)
    service = await gmail_service.create_service()

    # 3️⃣ Get latest 10 message IDs
    results = service.users().messages().list(
        userId="me",
        maxResults=10
    ).execute()

    messages = results.get("messages", [])
    email_data = []

    # 4️⃣ Fetch full details for each message
    for msg in messages:
        msg_id = msg["id"]

        full_msg = service.users().messages().get(
            userId="me",
            id=msg_id,
            format="full"
        ).execute()

        headers = full_msg["payload"]["headers"]

        subject = next(
            (h["value"] for h in headers if h["name"] == "Subject"),
            ""
        )

        sender = next(
            (h["value"] for h in headers if h["name"] == "From"),
            ""
        )

        date_header = next(
            (h["value"] for h in headers if h["name"] == "Date"),
            None
        )

        timestamp = None
        if date_header:
            try:
                timestamp = parsedate_to_datetime(date_header)
            except:
                timestamp = None

        # 🧠 Extract body
        body = ""

        if "parts" in full_msg["payload"]:
            for part in full_msg["payload"]["parts"]:
                if part["mimeType"] == "text/plain":
                    data = part["body"].get("data")
                    if data:
                        body = base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
                        break
        else:
            data = full_msg["payload"]["body"].get("data")
            if data:
                body = base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")

        category = classify_email(subject, body)


        # ✅ GET LABEL ID FROM DB
        label_doc = await gmail_labels_collection.find_one({
            "user_id": ObjectId(admin["user_id"]),
            "label_name": category
        })

        # ✅ APPLY LABEL
        if label_doc:
            label_id = label_doc["label_id"]

            service.users().messages().modify(
                userId="me",
                id=msg_id,
                body={"addLabelIds": [label_id]}
            ).execute()

        ts_str = (
            timestamp.isoformat()
            if timestamp and hasattr(timestamp, "isoformat")
            else (timestamp if isinstance(timestamp, str) else "")
        )
        email_data.append({
            "message_id": msg_id,
            "subject": subject,
            "sender": sender,
            "category": category,
            "timestamp": ts_str,
        })

    return {"total_emails": len(email_data), "emails": email_data}



@router.post("/gmail/setup-labels")
async def setup_custom_labels(
    admin=Depends(require_employee)
):
    user = await user_collection.find_one(
        {"_id": ObjectId(admin["user_id"])}
    )

    if not user:
        return {"error": "User not found"}

    gmail_service = GmailService(user)
    service = await gmail_service.create_service()

    # Attach service instance
    gmail_service.service = service

    labels_to_create = ["Work", "Urgent", "Finance", "Notifications"]

    created_labels = {}

    for label_name in labels_to_create:
        label_id = await gmail_service.create_label_if_not_exists(label_name)
        created_labels[label_name] = label_id
        

    return {
        "message": "Labels created successfully",
        "labels": created_labels
    }


@router.post("/gmail/auto-organize")
async def auto_organize_emails(
    admin=Depends(require_employee)
):
    # 1️⃣ Get user
    user = await user_collection.find_one(
        {"_id": ObjectId(admin["user_id"])}
    )

    if not user:
        return {"error": "User not found"}

    # 2️⃣ Create Gmail service
    gmail_service = GmailService(user)
    service = await gmail_service.create_service()

    # 3️⃣ Fetch latest emails
    results = service.users().messages().list(
        userId="me",
        maxResults=20
    ).execute()

    messages = results.get("messages", [])

    processed = 0
    skipped = 0

    for msg in messages:
        msg_id = msg["id"]

        # 🔍 4️⃣ CHECK IF ALREADY CLASSIFIED
        existing = await email_collection.find_one({
            "user_id": ObjectId(admin["user_id"]),
            "message_id": msg_id
        })

        if existing:
            skipped += 1
            continue  # Skip old emails

        # 5️⃣ Fetch full message
        full_msg = service.users().messages().get(
            userId="me",
            id=msg_id,
            format="full"
        ).execute()

        headers = full_msg["payload"]["headers"]

        subject = next(
            (h["value"] for h in headers if h["name"] == "Subject"),
            ""
        )

        sender = next(
            (h["value"] for h in headers if h["name"] == "From"),
            ""
        )

        body = ""

        if "parts" in full_msg["payload"]:
            for part in full_msg["payload"]["parts"]:
                if part["mimeType"] == "text/plain":
                    data = part["body"].get("data")
                    if data:
                        body = base64.urlsafe_b64decode(data).decode(
                            "utf-8", errors="ignore"
                        )
                        break
        else:
            data = full_msg["payload"]["body"].get("data")
            if data:
                body = base64.urlsafe_b64decode(data).decode(
                    "utf-8", errors="ignore"
                )

        # 🧠 6️⃣ CLASSIFY WITH GEMINI
        category = classify_email(subject, body)

        # 7️⃣ Get label id from DB
        label_doc = await gmail_labels_collection.find_one({
            "user_id": ObjectId(admin["user_id"]),
            "label_name": category
        })

        if label_doc:
            label_id = label_doc["label_id"]
            await gmail_service.apply_label_to_email(msg_id, label_id)
        print(f"Email '{subject}' classified as '{category}' and labeled in Gmail.")
        # 8️⃣ SAVE TO DB
        await email_collection.insert_one({
            "user_id": ObjectId(admin["user_id"]),
            "message_id": msg_id,
            "subject": subject,
            "sender": sender,
            "category": category,
            "classified_at": datetime.utcnow()
        })

        processed += 1

    return {
        "processed_new_emails": processed,
        "skipped_existing_emails": skipped
    }

