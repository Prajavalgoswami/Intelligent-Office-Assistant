import os
MONGO_URL="mongodb+srv://IOA_DB:XEDatT0hsfgrTIFM@ioa.jikco8e.mongodb.net/?appName=IOA"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 20