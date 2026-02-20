import asyncio
from app.services.meeting_service import handle_meeting_create

user = {"id": "user123"}

tests = [
    "Schedule meeting sometime",
    "Tomorrow",
    "4 pm",
    "Book meeting next friday at 10 am",
    "meeting tommorow",
    "have a meeting at 9am from 12 january"
]

async def run_tests():
    for msg in tests:
        res = await handle_meeting_create(msg, user)
        print(f"USER: {msg}")
        print(f"BOT : {res['response']}")
        print("-" * 40)

asyncio.run(run_tests())
