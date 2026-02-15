# Simple in-memory conversation state
conversation_state = {}
def get_user_state(user_id: str):
    return conversation_state.get(user_id, {})


def update_user_state(user_id: str, data: dict):
    if user_id not in conversation_state:
        conversation_state[user_id] = {}
    conversation_state[user_id].update(data)


def clear_user_state(user_id: str):
    if user_id in conversation_state:
        del conversation_state[user_id]
