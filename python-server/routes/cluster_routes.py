# Note: This file is imported in the main app but not shown in full since it's mentioned as an import
from flask import Blueprint, jsonify, request

cluster_bp = Blueprint('cluster', __name__)


from clustering_routes import index, cluster_users, cluster_summary


@cluster_bp.route('/index', methods=['GET'])
def index_route():
    return index()

@cluster_bp.route('/cluster-users', methods=['POST'])
def cluster_users_route():
    return cluster_users()

@cluster_bp.route('/cluster-summary', methods=['GET'])
def cluster_summary_route():
    return cluster_summary()