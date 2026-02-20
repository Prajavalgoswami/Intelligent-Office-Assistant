from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        # group_id -> list of websockets
        self.group_connections: Dict[str, List[WebSocket]] = {}

        # user_id -> websocket
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, group_id: str, user_id: str, websocket: WebSocket):
        await websocket.accept()

        # Store group connection
        if group_id not in self.group_connections:
            self.group_connections[group_id] = []

        self.group_connections[group_id].append(websocket)

        # Store personal connection
        self.user_connections[user_id] = websocket

    def disconnect(self, group_id: str, user_id: str, websocket: WebSocket):
        if group_id in self.group_connections:
            if websocket in self.group_connections[group_id]:
                self.group_connections[group_id].remove(websocket)

        if user_id in self.user_connections:
            self.user_connections.pop(user_id, None)

    async def broadcast_to_group(self, group_id: str, message: dict):
        if group_id in self.group_connections:
            for connection in self.group_connections[group_id]:
                await connection.send_json(message)

    async def send_to_user(self, user_id: str, message: dict):
        websocket = self.user_connections.get(user_id)
        if websocket:
            await websocket.send_json(message)


manager = ConnectionManager()
