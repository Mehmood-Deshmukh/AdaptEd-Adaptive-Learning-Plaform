from flask import Blueprint, request, jsonify
import logging
from typing import List

from services.roadmap_service import generate_roadmap

logger = logging.getLogger(__name__)
roadmap_bp = Blueprint('roadmap', __name__)

@roadmap_bp.route('/api/generate-roadmap', methods=['POST'])
def roadmap_endpoint():
    try:
        data = request.get_json()
        
        if not data or not data.get('topic'):
            return jsonify({"error": "Missing topic parameter"}), 400
            
        topic = data.get('topic')
        summary = data.get('summary', '')
            
        roadmap = generate_roadmap(topic, summary)
        
        if "error" in roadmap:
            return jsonify(roadmap), 500
            
        return jsonify(roadmap), 200
        
    except Exception as e:
        logger.error(f"Endpoint error: {str(e)}")
        return jsonify({"error": f"Failed to process request: {str(e)}"}), 500

@roadmap_bp.route('/api/generate-recommendations', methods=['POST'])
def generate_recommendations():
    try:
        import re
        from services.vector_store import get_resources_vector_store, retrieve_relevant_resources
        
        data = request.get_json()
        
        if not data or not data.get('summary'):
            return jsonify({"error": "Missing summary parameter"}), 400
            
        summary = data.get('summary')
        
        visual_learning_threshold = 5.0
        easy_difficulty = "beginner"
        
        domain_interests = []
        visual_learning_score = 0.0
        for line in summary.split('\n'):
            if "domain interests" in line:
                domain_interests = re.findall(r'\b\w+\b', line.split(":")[1])
            if "visualLearning" in line:
                visual_learning_score = float(re.findall(r'\d+\.\d+', line)[0])
        
        difficulty = easy_difficulty if visual_learning_score > visual_learning_threshold else "intermediate"
        
        vector_store = get_resources_vector_store()
        topic = " ".join(domain_interests)
        retrieved_resources = retrieve_relevant_resources(topic, vector_store)
        
        filtered_resources = [res for res in retrieved_resources if res.get("difficulty") == difficulty]
        
        return jsonify(filtered_resources[:3]), 200
        
    except Exception as e:
        logger.error(f"Error generating resources: {str(e)}")
        return jsonify({"error": f"Failed to generate resources: {str(e)}"}), 500