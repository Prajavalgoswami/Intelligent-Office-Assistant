async def handle_task_query(user):
    return {
        "type": "task_list",
        "response": "You have 2 pending tasks.",
        "data": []
    }
