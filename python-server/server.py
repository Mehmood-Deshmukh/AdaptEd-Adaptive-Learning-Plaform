from flask import Flask
import logging
import os
import threading
import time

from config import DB_NAME
from routes import register_routes
from services.vector_store import load_projects, check_and_update_vector_stores

app = Flask(__name__)
app.logger.setLevel(logging.DEBUG)

def init_app():
    try:
        load_projects()
        check_and_update_vector_stores()
        
        app.logger.info("Application initialized successfully")
    except Exception as e:
        app.logger.error(f"Failed to initialize application: {str(e)}")

# Register all routes
register_routes(app)

# Initialize the application
init_app()

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=8000)