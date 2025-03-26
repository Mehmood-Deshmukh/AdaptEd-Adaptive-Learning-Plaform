from flask import Blueprint
from .roadmap_routes import roadmap_bp
from .quiz_routes import quiz_bp
from .project_routes import project_bp
from .cluster_routes import cluster_bp

def register_routes(app):
    app.register_blueprint(roadmap_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(project_bp)
    app.register_blueprint(cluster_bp, url_prefix='/clusters')