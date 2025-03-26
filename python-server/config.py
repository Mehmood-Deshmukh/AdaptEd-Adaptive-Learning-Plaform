import os
from dotenv import load_dotenv

load_dotenv()

# Constants
RESOURCES_FAISS_INDEX_PATH = "resources_faiss_index"
QUESTIONS_FAISS_INDEX_PATH = "questions_faiss_index"
PROJECTS_FAISS_INDEX_PATH = "projects_faiss_index"
EMBEDDINGS_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
MONGODB_URI = "mongodb://localhost:27017"
DB_NAME = "inspiron25"
UPDATE_INTERVAL_DAYS = 7
LAST_UPDATE_FILE = "last_update.json"   