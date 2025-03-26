import os
import json
import logging
from datetime import datetime, timedelta
from pymongo import MongoClient
from typing import Dict

from config import MONGODB_URI, DB_NAME, LAST_UPDATE_FILE

logger = logging.getLogger(__name__)

def get_mongodb_client():
    try:
        client = MongoClient(MONGODB_URI)
        return client
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise

def get_last_update_info() -> Dict[str, datetime]:
    if os.path.exists(LAST_UPDATE_FILE):
        try:
            with open(LAST_UPDATE_FILE, 'r') as f:
                data = json.load(f)
                return {
                    k: datetime.fromisoformat(v) 
                    for k, v in data.items()
                }
        except Exception as e:
            logger.error(f"Error reading last update info: {e}")
    
    now = datetime.now() - timedelta(days=UPDATE_INTERVAL_DAYS + 1) 
    return {
        "resources": now,
        "questions": now
    }

def save_last_update_info(update_info: Dict[str, datetime]):
    with open(LAST_UPDATE_FILE, 'w') as f:
        json_data = {
            k: v.isoformat() 
            for k, v in update_info.items()
        }
        json.dump(json_data, f)