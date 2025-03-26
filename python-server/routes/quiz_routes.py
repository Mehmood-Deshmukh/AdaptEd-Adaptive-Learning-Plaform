from flask import Blueprint, request, jsonify
import logging
from typing import List

from services.quiz_service import generate_quiz

logger = logging.getLogger(__name__)
quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/api/generate-quiz', methods=['POST'])
def quiz_endpoint():
    try:
        data = request.get_json()
        
        if not data or not data.get('topic'):
            return jsonify({"error": "Missing topic parameter"}), 400
            
        topic = data.get('topic')
        domain = data.get('domain', 'Computer Science')
        difficulty = data.get('difficulty', 'beginner')
        tags = data.get('tags', [])
            
        quiz = generate_quiz(topic, domain, difficulty, tags)
        
        if "error" in quiz:
            return jsonify(quiz), 500
            
        return jsonify(quiz), 200
        
    except Exception as e:
        logger.error(f"Quiz endpoint error: {str(e)}")
        return jsonify({"error": f"Failed to process quiz request: {str(e)}"}), 500