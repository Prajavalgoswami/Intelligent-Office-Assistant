from backend.app.core.database import super_admin_collection
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
def hasher(st):
    x=pwd_context.hash(st)
    return x
def check() : 
    print("What do you want ? \n 1. Create Super Admin \n 2. Hash the password.")
    n=int(input())
    if(n==1) :
        insert()
    if(n==2) :
        print("Enter Your Password")
        get_pass=input()
        print(hasher(get_pass))
check()