from pydantic import BaseModel # pyright: ignore[reportMissingImports]


class ServiceRequestCreate(BaseModel):
    title: str
    description: str
    category: str  # "hardware" | "software"

class ServiceRequestStatusUpdate(BaseModel):
    status: str  # open | in_progress | resolved
class ServiceRequestAssign(BaseModel):
    assigned_to: str
