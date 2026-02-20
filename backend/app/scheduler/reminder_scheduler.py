from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.reminder_scheduler import check_and_send_reminders


scheduler = AsyncIOScheduler()


def start_scheduler():
    scheduler.add_job(
        check_and_send_reminders,
        "interval",
        minutes=1   # 🔥 check every 1 minute
    )
    scheduler.start()
