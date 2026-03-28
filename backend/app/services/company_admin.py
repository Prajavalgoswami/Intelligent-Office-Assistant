from typing import Optional
from bson import ObjectId
from fastapi import BackgroundTasks, HTTPException, UploadFile, status, HTTPException
from app.core.database import (
    user_collection, department_collection,
    role_collection, user_role_collection,company_collection,company_settings_collection
)
from app.auth.password import generate_temp_password, hash_password, verify_password
from app.utils.username import normalize_username
from app.auth.jwt import create_company_admin_token
from app.schemas.company_admin import RoleCreate, UserCreate
from app.models.role import Role
from app.models.user import User
from app.models.user_role import UserRole
from app.models.department import Department as DepartmentModel
from app.models.company_settings import CompanySettings
from app.schemas.department import Department as DepartmentSchema
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import os
import fitz
from uuid import uuid4

import chromadb
async def login_company_admin(email: str, password: str):
    user_doc = await user_collection.find_one({
        "email": email,
        "status": "active"  
    })

    if not user_doc:
        return None

    if not verify_password(password, user_doc.get("password")):
        return None

    admin_role_check = await user_role_collection.find_one({
        "user_id": str(user_doc["_id"]),
        "role_id": {"$in": await get_company_admin_role_ids(user_doc["company_id"])}
    })

    if not admin_role_check:
        return None

    token = create_company_admin_token(
        user_id=str(user_doc["_id"]),
        company_id=user_doc["company_id"]
    )

    return token

async def get_company_admin_role_ids(company_id: str):
    cursor = role_collection.find({
        "company_id": company_id,
        "role_name": {"$regex": "^company.?admin$", "$options": "i"}
    })
    return [str(doc["_id"]) async for doc in cursor]
async def create_department(company_id: str, name: str, description: Optional[str] = None):
    
    existing = await department_collection.find_one({
        "company_id": company_id,
        "department_name": {"$regex": f"^{name}$", "$options": "i"}
    })

    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")

    dept_id = ObjectId()

    department = DepartmentModel(
        _id=dept_id,
        company_id=company_id,
        department_name=name,
        description=description or ""
    )

    result = await department_collection.insert_one(
        department.model_dump(by_alias=True)
    )

    return str(result.inserted_id)

async def create_role_service(company_id: str, role_data: RoleCreate):
    existing = await role_collection.find_one({
        "company_id": company_id,
        "role_name": {"$regex": f"^{role_data.role_name}$", "$options": "i"}
    })
    if existing:
        raise HTTPException(status_code=400, detail="Role already exists")

    new_role = Role(company_id=company_id, role_name=role_data.role_name)
    result = await role_collection.insert_one(new_role.model_dump(by_alias=True))
    return str(result.inserted_id)

async def create_user_service(company_id: str, user_data: UserCreate):
    # Validate department
    dept = await department_collection.find_one({
        "_id": ObjectId(user_data.department_id),
        "company_id": company_id
    })
    if not dept:
        raise HTTPException(404, "Department not found")

    try:
        uname = normalize_username(user_data.username)
    except ValueError as e:
        raise HTTPException(400, str(e))

    taken = await user_collection.find_one({"username": uname})
    if taken:
        raise HTTPException(400, "Username already taken")

    # Validate roles
    validated_roles = []
    for role_id_str in user_data.role_ids:
        try:
            role_oid = ObjectId(role_id_str)
        except:
            raise HTTPException(400, f"Invalid role ID: {role_id_str}")

        role = await role_collection.find_one({
            "_id": role_oid,
            "company_id": company_id
        })
        if not role and role_id_str!="69655cd6c96b6cc9dd48f50b":
            raise HTTPException(404, f"Role not found: {role_id_str}")
        validated_roles.append(role_oid)

    # Password
    raw_pw = user_data.password or generate_temp_password()
    hashed_pw = hash_password(raw_pw)
    is_temp = not user_data.password

    # Create user
    new_user = User(
        company_id=company_id,
        username=uname,
        name=user_data.name,
        email=user_data.email,
        password=hashed_pw,
        department_id=user_data.department_id,
        status="active"
    )
    result = await user_collection.insert_one(new_user.model_dump(by_alias=True))
    user_id = str(result.inserted_id)

    # Assign roles
    for role_oid in validated_roles:
        await user_role_collection.insert_one(
            UserRole(user_id=ObjectId(user_id), role_id=role_oid).model_dump(by_alias=True)
        )

    response = {
        "message": "User created successfully",
        "user_id": user_id,
        "username": uname,
        "email": user_data.email
    }

    if is_temp:
        response["temporary_password"] = raw_pw
        print(f"[TEMP] {user_data.email}: {raw_pw}")

    return response

from bson import ObjectId

async def get_departments_service(company_id: str):
    depts = []

    async for doc in department_collection.find({"company_id": company_id}):

        # 🔥 Convert ObjectId to string
        department_id_str = str(doc["_id"])

        member_count = await user_collection.count_documents({
            "department_id": department_id_str
        })

        doc["member_count"] = member_count
        doc["id"] = department_id_str
        del doc["_id"]

        depts.append(DepartmentSchema(**doc))

        print(f"Department: {doc['department_name']}, Members: {member_count}")

    return depts

async def get_roles_service(company_id: str):
    roles = []
    async for doc in role_collection.find({"company_id": company_id}):
        roles.append(Role(**doc))
    return roles



UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def extract_policy_text(filename: str, content: bytes) -> str:
    filename = filename.lower()

    if not content:
        raise ValueError("Uploaded file is empty")

    if filename.endswith(".pdf"):
        doc = fitz.open(stream=content, filetype="pdf")
        return "\n".join(page.get_text() for page in doc).strip()

    if filename.endswith(".txt"):
        return content.decode("utf-8").strip()

    raise ValueError("Only PDF or TXT files are supported")

async def embed_company_content(company_id: str, content: str):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_text(content)

    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(chunks).tolist()

    chroma = chromadb.Client()
    collection = chroma.get_or_create_collection(
        name=f"company_{company_id}_embeddings"
    )

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[str(uuid4()) for _ in chunks]
    )

    await company_settings_collection.update_one(
        {"company_id": company_id},
        {
            "$set": {
                "embedded_chunks": chunks,
                "vector_store_id": f"company_{company_id}_embeddings",
            }
        }
    )

    print(f" Embedding completed for company {company_id}")

async def complete_onboarding_service(
    user_id: str,
    company_id: str,
    services: str,
    policies_text: str | None,
    policies_file: UploadFile | None,
    background_tasks: BackgroundTasks,
):
    if not policies_text and not policies_file:
        raise HTTPException(400, "Provide policies text or file")

    file_path = None

    if policies_file:
        content = await policies_file.read()  # ✅ READ ONCE

        file_path = f"{UPLOAD_DIR}/{company_id}_{policies_file.filename}"
        with open(file_path, "wb") as f:
            f.write(content)

        policies_text = await extract_policy_text(
            policies_file.filename,
            content
        )

    settings = CompanySettings(
        company_id=company_id,
        services_description=services,
        policies_text=policies_text,
        policies_file_path=file_path,
        embedded_chunks=[],
        vector_store_id=None,
    )

    await company_settings_collection.insert_one(
        settings.model_dump()
    )

    background_tasks.add_task(
        embed_company_content,
        company_id,
        services + "\n" + policies_text,
    )

    await user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"first_login": False}},
    )

    await company_collection.update_one(
        {"_id": ObjectId(company_id)},
        {
            "$set": {
                "onboarding_completed": True,
                "status": "ACTIVE",
            }
        },
    )