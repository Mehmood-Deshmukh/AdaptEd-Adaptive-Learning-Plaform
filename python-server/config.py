import os
from dotenv import load_dotenv

load_dotenv()

RESOURCES_FAISS_INDEX_PATH = "resources_faiss_index"
QUESTIONS_FAISS_INDEX_PATH = "questions_faiss_index"
PROJECTS_FAISS_INDEX_PATH = "projects_faiss_index"
EMBEDDINGS_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
MONGODB_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
UPDATE_INTERVAL_DAYS = 7
LAST_UPDATE_FILE = "last_update.json"   