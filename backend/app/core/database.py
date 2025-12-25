from pymongo import MongoClient
from app.core.config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client["ioa_db"]

company_col = db["companies"]
user_col = db["users"]
department_col = db["departments"]
role_col = db["roles"]
permission_col = db["permissions"]
email_col = db["emails"]
task_col = db["tasks"]
chat_group_col = db["chat_groups"]
chat_msg_col = db["chat_messages"]
