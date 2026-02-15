<<<<<<< Updated upstream
MONGO_URI="mongodb+srv://IOA_DB:XEDatT0hsfgrTIFM@ioa.jikco8e.mongodb.net/?appName=IOA"
=======
import os
MONGO_URL = "mongodb+srv://IOA_DB:XEDatT0hsfgrTIFM@ioa.jikco8e.mongodb.net/?appName=IOA"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 20
GOOGLE_CLIENT_ID=os.getenv("GOOGLE_CLIENT_ID")



from pydantic_settings import BaseSettings

from pydantic import Field

class Settings(BaseSettings):

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_EXPIRE_MINUTES: int

    MONGO_URL: str

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
>>>>>>> Stashed changes
