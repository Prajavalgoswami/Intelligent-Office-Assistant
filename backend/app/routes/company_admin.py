from fastapi import (
    APIRouter, Depends, HTTPException, status,
    UploadFile, File, Form, BackgroundTasks
)
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel

from app.auth.dependencies import require_company_admin
from app.auth.jwt import create_company_admin_token
from app.auth.google_auth import verify_google_token

from app.auth.password import verify_password
from app.schemas.company_admin import (
    RoleCreate, UserCreate, DepartmentCreate
)
from app.services.company_admin import (
    create_department, create_role_service, create_user_service,
    get_departments_service, get_roles_service,
    complete_onboarding_service
)

from app.core.database import (
    user_collection, user_role_collection, role_collection
)

from app.services.ai_classifier import classify_email


router = APIRouter(prefix="/company-admin", tags=["Company Admin"])
class AdminIdPasswordLogin(BaseModel):
    username: str
    password: str


@router.post("/login/admin-username-password")
async def login_company_admin_with_username_and_password(
    request: AdminIdPasswordLogin
):
    if not request.username.startswith("admin_"):
        raise HTTPException(401, "Invalid username or password")

    try:
        oid_str = request.username[6:]
        admin_oid = ObjectId(oid_str)
    except:
        raise HTTPException(401, "Invalid username or password")

    admin = await user_collection.find_one({
        "_id": admin_oid,
        "status": "active"
    })

    if not admin or not verify_password(request.password, admin.get("password")):
        raise HTTPException(401, "Invalid username or password")

    admin_id = str(admin["_id"])
    company_id = admin["company_id"]

    # Company admin has fixed role
    access_token = create_company_admin_token(
        user_id=admin_id,
        company_id=company_id
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
class GoogleLoginRequest(BaseModel):
    token: str
@router.post("/login/google")
async def company_admin_google_login(payload: GoogleLoginRequest):
    token=payload.token
    google_user = verify_google_token(token)
    email = google_user["email"]

    user_doc = await user_collection.find_one({
        "email": email,
        "status": "active"
    })

    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not found or inactive"
        )

    admin_role = await role_collection.find_one({
        "role_name": "Company Admin",
        "scope": "SYSTEM"
    })

    if not admin_role:
        raise HTTPException(500, "Company Admin role not configured")

    has_role = await user_role_collection.find_one({
        "user_id": ObjectId(user_doc["_id"]),
        "role_id": admin_role["_id"]
    })

    if not has_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as Company Admin"
        )

    jwt_token = create_company_admin_token(
        user_id=str(user_doc["_id"]),
        company_id=str(user_doc["company_id"]),
        first_login=user_doc.get("first_login", True)
    )

    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "first_login": user_doc.get("first_login", True)
    }
@router.get("/me")
async def get_current_admin(
    admin=Depends(require_company_admin)
):
    user = await user_collection.find_one(
        {"_id": ObjectId(admin["user_id"])},
        {"password": 0}
    )

    return {
        "user_id": admin["user_id"],
        "company_id": admin["company_id"],
        "email": user["email"],
        "name": user["name"],
        "first_login": user.get("first_login", False)
    }

# DEPARTMENTS
@router.post("/departments")
async def create_department_api(
    request: DepartmentCreate,
    admin=Depends(require_company_admin)
):
    dept_id = await create_department(
        company_id=admin["company_id"],
        name=request.department_name,
        description=request.description
    )
    return {"message": "Department created", "department_id": dept_id}


@router.get("/departments")
async def list_departments(
    admin=Depends(require_company_admin)
):
    return await get_departments_service(admin["company_id"])

# ROLES
@router.post("/roles")
async def create_role(
    role_data: RoleCreate,
    admin=Depends(require_company_admin)
):
    role_id = await create_role_service(admin["company_id"], role_data)
    return {"message": "Role created", "role_id": role_id}


@router.get("/roles")
async def list_roles(
    admin=Depends(require_company_admin)
):
    return await get_roles_service(admin["company_id"])

#OnBOARDING
@router.post("/onboarding")
async def complete_onboarding(
    services: str = Form(...),
    policies_text: Optional[str] = Form(None),
    policies_file: Optional[UploadFile] = File(None),
    admin=Depends(require_company_admin),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    user_doc = await user_collection.find_one(
        {"_id": ObjectId(admin["user_id"])},
        {"first_login": 1}
    )

    if not user_doc or not user_doc.get("first_login", False):
        raise HTTPException(
            status_code=403,
            detail="Onboarding already completed"
        )

    await complete_onboarding_service(
        user_id=admin["user_id"],
        company_id=admin["company_id"],
        services=services,
        policies_text=policies_text,
        policies_file=policies_file,
        background_tasks=background_tasks
    )

    return {"message": "Onboarding completed successfully"}

@router.post("/users")
async def create_user(
    user_data: UserCreate,
    admin = Depends(require_company_admin)
):
    try:
        result = await create_user_service(
            company_id=admin["company_id"],
            user_data=user_data
        )
        return result
    except HTTPException as e:
        raise e  # Let FastAPI handle known exceptions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

# Test Endpoint

from fastapi import Depends, APIRouter
from app.services.gmail_service import GmailService
from app.auth.dependencies import get_current_user
from app.models.user import User

from fastapi import Depends
from app.services.gmail_service import GmailService
from app.auth.dependencies import get_current_user
from app.core.database import user_collection
from app.core.database import user_collection, gmail_labels_collection



from bson import ObjectId

@router.get("/gmail/test")
async def test_gmail(admin=Depends(require_company_admin)):

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
    admin=Depends(require_company_admin)
):
    from app.services.gmail_service import GmailService
    from app.core.database import user_collection
    from bson import ObjectId

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



import base64
from email.utils import parsedate_to_datetime
from fastapi import Depends
from bson import ObjectId
from app.services.email_classifier_service import EmailClassifierService

@router.get("/gmail/full-messages")
async def fetch_full_email_details(
    admin=Depends(require_company_admin)
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

        # ✅ CLASSIFY EMAIL
        

        classifier = EmailClassifierService()
        category = await classifier.classify(subject, body)


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

        email_data.append({
            "message_id": msg_id,
            "subject": subject,
            "sender": sender,
            "category": category,
            "timestamp": timestamp
        })

    return {
        "total_emails": len(email_data),
        "emails": email_data
    }



@router.post("/gmail/setup-labels")
async def setup_custom_labels(
    admin=Depends(require_company_admin)
):
    from app.services.gmail_service import GmailService
    from app.core.database import user_collection
    from bson import ObjectId

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


from datetime import datetime
import base64
from email.utils import parsedate_to_datetime

@router.post("/gmail/auto-organize")
async def auto_organize_emails(
    admin=Depends(require_company_admin)
):
    from app.services.gmail_service import GmailService
    from app.core.database import user_collection, email_collection, gmail_labels_collection
    from app.services.ai_classifier import classify_email
    from bson import ObjectId

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
