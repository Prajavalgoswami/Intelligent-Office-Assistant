from typing import Optional
from bson import ObjectId
from fastapi import BackgroundTasks, HTTPException, UploadFile, status
from app.core.database import (
    user_collection, department_collection,
    role_collection, user_role_collection,company_collection,company_settings_collection
)
from app.auth.password import generate_temp_password, hash_password, verify_password
from app.auth.jwt import create_company_admin_token
from app.company_admin.schema import RoleCreate, UserCreate
from app.models.role import Role
from app.models.user import User
from app.models.user_role import UserRole
from app.models.department import Department
from app.models.company_settings import CompanySettings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
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

    department = Department(
        company_id=company_id,
        department_name=name,
        description=description or ""
    )
    result = await department_collection.insert_one(department.model_dump(by_alias=True))
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
    if not await department_collection.find_one({
        "_id": ObjectId(user_data.department_id),
        "company_id": company_id
    }):
        raise HTTPException(status_code=404, detail="Department not found")

    validated_role_ids = []
    for role_id in user_data.role_ids:
        if not await role_collection.find_one({
            "_id": ObjectId(role_id),
            "company_id": company_id
        }):
            raise HTTPException(status_code=404, detail=f"Invalid role: {role_id}")
        validated_role_ids.append(role_id)

    raw_password = user_data.password or generate_temp_password()
    hashed_password = hash_password(raw_password)

    new_user = User(
        company_id=company_id,
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        department_id=user_data.department_id,
        status="active"
    )
    result = await user_collection.insert_one(new_user.model_dump(by_alias=True))
    user_id = str(result.inserted_id)

    # Assign roles
    for role_id in validated_role_ids:
        await user_role_collection.insert_one(
            UserRole(user_id=ObjectId(user_id), role_id=ObjectId(role_id)).model_dump(by_alias=True)
        )

    response = {
        "message": "User created successfully",
        "user_id": user_id,
        "email": user_data.email
    }
    if not user_data.password:
        response["temporary_password"] = raw_password
        print(f"Temporary password for {user_data.email}: {raw_password}")

    return response

async def get_departments_service(company_id: str):
    depts = []
    async for doc in department_collection.find({"company_id": company_id}):
        depts.append(Department(**doc))
    return depts

async def get_roles_service(company_id: str):
    roles = []
    async for doc in role_collection.find({"company_id": company_id}):
        roles.append(Role(**doc))
    return roles

async def complete_onboarding_service(
    user_id: str, company_id: str, services: str, policies_text: Optional[str],
    policies_file: Optional[UploadFile], background_tasks: BackgroundTasks
):
    if not policies_text and not policies_file:
        raise HTTPException(status_code=400, detail="Provide policies text or file")

    if policies_file:
        content = await policies_file.read()
        import fitz  # PyMuPDF
        doc = fitz.open(stream=content, filetype="pdf")
        policies_text = "".join(page.get_text() for page in doc)

    settings = CompanySettings(company_id=company_id, services_description=services, policies_text=policies_text)
    await company_settings_collection.insert_one(settings.model_dump(by_alias=True))

    background_tasks.add_task(embed_company_content, company_id, services + "\n" + policies_text)

    await user_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"first_login": False}})
    await company_collection.update_one({"_id": ObjectId(company_id)}, {"$set": {"onboarding_completed": True, "status": "ACTIVE"}})

async def embed_company_content(company_id: str, content: str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_text(content)
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(chunks).tolist()
    chroma = chromadb.Client()
    collection = chroma.get_or_create_collection(name=f"company_{company_id}_embeddings")
    collection.add(documents=chunks, embeddings=embeddings)