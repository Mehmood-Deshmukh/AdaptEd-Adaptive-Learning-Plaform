import json
import logging
import re
from typing import Dict, Any

from services.vector_store import get_projects_vector_store

logger = logging.getLogger(__name__)

def get_project_by_title(title: str) -> Dict[str, Any]:
    try:
        # Get the vector store
        vector_store = get_projects_vector_store()
        
        # Use exact title search
        retriever = vector_store.as_retriever(search_kwargs={"k": 10})
        retrieved_docs = retriever.get_relevant_documents(f"Title: {title}")
        
        # Find exact match
        project = None
        for doc in retrieved_docs:
            if doc.metadata.get("title", "").lower() == title.lower():
                project = doc.metadata
                break
        
        if not project:
            return {"error": f"Project with title '{title}' not found"}
        
        # Format the project in a clean structure
        formatted_project = format_project(project)
        
        return formatted_project
        
    except Exception as e:
        logger.error(f"Error getting project: {str(e)}")
        return {"error": f"Failed to get project: {str(e)}"}

def get_projects_overview():
    """Get all projects with just titles and images"""
    try:
        with open("codedex_projects.json", "r", encoding="utf-8") as f:
            projects = json.load(f)
        
        overview = []
        for project in projects:
            overview.append({
                "title": project.get("title", ""),
                "link": project.get("link", ""),
                "tags": project.get("tags", []),
                "image": project.get("image", ""),
                "prerequisite": project.get("prerequisite", {})
            })
        
        return overview
        
    except Exception as e:
        logger.error(f"Failed to get projects overview: {str(e)}")
        return {"error": str(e)}

def format_project(project: Dict[str, Any]) -> Dict[str, Any]:
    # Helper function to clean markdown formatting
    def clean_markdown(text):
        if not text:
            return ""
        # Remove heading markers
        text = re.sub(r'^#+\s+', '', text)
        # Remove bold/italic markers
        text = re.sub(r'\*\*|\*|__|\^', '', text)
        # Remove list markers
        text = re.sub(r'^\s*[-*+]\s+', '', text)
        # Remove code markers
        text = re.sub(r'`', '', text)
        return text.strip()
    
    # Format the project in a clean structure
    formatted_project = {
        "title": project.get("title", "Untitled Project"),
        "link": project.get("link", ""),
        "tags": project.get("tags", []),
        "image": project.get("image", ""),
        "prerequisite": project.get("prerequisite", {}),
        "content": []
    }
    
    # Process and clean up checkpoints
    checkpoints = project.get("checkpoints", [])
    for checkpoint in checkpoints:
        # Clean section title from markdown
        clean_title = clean_markdown(checkpoint.get("checkpoint", ""))
        
        section = {
            "title": clean_title,
            "elements": []
        }
        
        # Process content sections
        for item in checkpoint.get("content", []):
            item_type = item.get("type", "")
            
            if item_type == "p":
                # Clean text content from markdown
                clean_content = clean_markdown(item.get("text", ""))
                section["elements"].append({
                    "type": "text",
                    "content": clean_content
                })
            elif item_type == "pre":
                # Code blocks remain as-is
                section["elements"].append({
                    "type": "code",
                    "content": item.get("text", "")
                })
            elif item_type == "img":
                section["elements"].append({
                    "type": "image",
                    "url": item.get("src", "")
                })
            elif item_type == "h3-li":
                # Handle header with list items
                clean_header = clean_markdown(item.get("h3", ""))
                list_items = item.get("li", [])
                
                # Add header as text first
                if clean_header:
                    section["elements"].append({
                        "type": "text",
                        "content": clean_header
                    })
                
                # Add list items as individual text elements
                for list_item in list_items:
                    clean_item = clean_markdown(list_item)
                    section["elements"].append({
                        "type": "text",
                        "content": f"• {clean_item}"
                    })
        
        formatted_project["content"].append(section)
    
    return formatted_project