# test_db.py
import asyncio
from core.database import ping_server, company_collection, user_collection
from models.company import Company
from models.user import User
from datetime import datetime

async def test_database():
    await ping_server()

    # Test 1: Insert a Company
    company_data = Company(
        company_name="TechCorp Solutions",
        domain="techcorp.com",
        status="active"
    )
    result = await company_collection.insert_one(company_data.model_dump(by_alias=True, exclude={"id"}))
    company_id = str(result.inserted_id)
    print(f" Company inserted with ID: {company_id}")

    # Test 2: Insert a User
    user_data = User(
        company_id=company_id,
        name="John Doe",
        email="john@techcorp.com",
        password="hashed_password_here",  # in real app, hash it
        department_id=None,
        status="active"
    )
    user_result = await user_collection.insert_one(user_data.model_dump(by_alias=True, exclude={"id"}))
    print(f" User inserted with ID: {str(user_result.inserted_id)}")

    # Test 3: Fetch the company back
    fetched_company = await company_collection.find_one({"_id": result.inserted_id})
    print(f" Fetched Company: {fetched_company['company_name']}")

    # Test 4: Query all users in this company
    async for user in user_collection.find({"company_id": company_id}):
        print(f" Found User: {user['name']} ({user['email']})")

if __name__ == "__main__":
    asyncio.run(test_database())