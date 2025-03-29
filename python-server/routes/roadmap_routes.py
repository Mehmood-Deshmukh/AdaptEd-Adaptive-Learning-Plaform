from flask import Blueprint, request, jsonify
import logging
from typing import List
import re
import json
from services.roadmap_service import generate_roadmap
from services.llm_service import get_llm
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

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

@roadmap_bp.route('/api/generate-confidence-score', methods=['POST'])
def generate_confidence_score():
    try:
        data = request.json
        print(data)
        request_type = data.get('requestType')
        payload = data.get('payload')
        
        confidence_prompt = PromptTemplate(
            template="""
            You are an AI tasked with analyzing user-submitted content for a learning platform to determine its confidence score.
            The confidence score represents how likely the submission is of high quality and should be approved.
            
            Request Type: {request_type}
            
            Content Details:
            {payload_json}
            
            Evaluate this submission on the following criteria:
            - Relevance: Is the content relevant to the platform?
            - Quality: Is the content well-structured, clear, and accurate?
            - Value: Does the content provide educational value?
            - Originality: Does the content appear to be original or properly cited?
            - Format: Is the content properly formatted according to its type?
            
            Provide:
            1. A confidence score between 0 and 100 (where 100 is highest confidence)
            2. A brief explanation of the reasoning behind the score
            
            Return ONLY a valid JSON object with "confidenceScore" and "confidenceReason" fields:
            ```json
            {{
                "confidenceScore": <score_as_integer>,
                "confidenceReason": "<brief_explanation>"
            }}
            ```
            """,
            input_variables=["request_type", "payload_json"]
        )
        
        llm = get_llm()
        
        chain = confidence_prompt | llm
        
        result = chain.invoke({
            "request_type": request_type,
            "payload_json": json.dumps(payload, indent=2)
        })
        

        text = result if isinstance(result, str) else result.content if hasattr(result, 'content') else str(result)

        print(text) 
        
        json_text = re.search(r'```(?:json)?\n?(.*?)```', text, re.DOTALL)
        if json_text:
            text = json_text.group(1)
            
        text = text.strip()
        
        try:
            confidence_data = json.loads(text)
        except json.JSONDecodeError:
            json_match = re.search(r'{[\s\S]*}', text)
            if json_match:
                confidence_data = json.loads(json_match.group(0))
            else:
                raise ValueError("Could not parse valid JSON from LLM response")

        confidence_score = int(confidence_data.get('confidenceScore', 0))
        confidence_score = max(0, min(100, confidence_score))  
        
        return jsonify({
            "success": True,
            "confidenceScore": confidence_score,
            "confidenceReason": confidence_data.get('confidenceReason', '')
        })
        
    except Exception as e:
        print(f"Error generating confidence score: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to generate confidence score: {str(e)}"
        }), 500