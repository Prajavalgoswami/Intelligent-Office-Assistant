from pydantic import BaseModel

class Permission(BaseModel):
    permission_name: str