from flask import Blueprint, request, jsonify
import logging

from services.project_service import get_project_by_title, get_projects_overview

logger = logging.getLogger(__name__)
project_bp = Blueprint('project', __name__)

@project_bp.route('/api/projects-overview', methods=['GET'])
def projects_overview_endpoint():
    """Get all projects with just titles and images"""
    try:
        overview = get_projects_overview()
        
        if isinstance(overview, dict) and "error" in overview:
            return jsonify(overview), 500
        
        return jsonify(overview), 200
    except Exception as e:
        logger.error(f"Failed to get projects overview: {str(e)}")
        return jsonify({"error": str(e)}), 500

@project_bp.route('/api/get-project', methods=['GET'])
def get_project_endpoint():
    """Get a project by its title"""
    try:
        title = request.args.get('title')
        
        if not title:
            return jsonify({"error": "Missing project title parameter"}), 400
        
        project = get_project_by_title(title)
        
        if "error" in project:
            return jsonify(project), 404 if "not found" in project["error"] else 500
            
        return jsonify(project), 200
        
    except Exception as e:
        logger.error(f"Error getting project: {str(e)}")
        return jsonify({"error": f"Failed to get project: {str(e)}"}), 500