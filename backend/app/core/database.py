from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGO_URL")
client = AsyncIOMotorClient(MONGODB_URL)
database = client.office_ai_db
company_collection = database.companies
department_collection = database.departments
role_collection = database.roles
permission_collection = database.permissions
role_permission_collection = database.role_permissions

user_collection = database.users
user_role_collection = database.user_roles

email_collection = database.emails
task_collection = database.tasks
meeting_collection = database.meetings

chat_group_collection = database.chat_groups
chat_group_member_collection = database.chat_group_members
chat_message_collection = database.chat_messages

document_collection = database.documents
document_embedding_collection = database.document_embeddings

company_config_collection = database.company_configs
super_admin_collection = database.super_admins

# Optional: Health check function
async def get_database():
    return database

async def ping_server():
    try:
        await client.admin.command('ping')
        print("MongoDB connection successful! 🚀")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")