import os
MONGO_URL="your_mongo_uri"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 20
GOOGLE_CLIENT_ID=os.getenv("GOOGLE_CLIENT_ID")