from app.core.database import super_admin_collection
from passlib.context import CryptContext
#use this code to insert a super admin
pwd_context=CryptContext(schemes=["argon2"],deprecated="auto")
hpw=pwd_context.hash("password123")
def insert() :
    success=super_admin_collection.insert_one({
    "name": "Platform Owner",
    "email": "admin@ioa.com",
    "password_hash":hpw,
    "is_active": True
    }
    )
    if success:
        print("yay")
    else :
        print("oops")
insert()