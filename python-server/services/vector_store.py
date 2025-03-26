import os
import pickle
import logging
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pickle

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

from config import (
    RESOURCES_FAISS_INDEX_PATH,
    QUESTIONS_FAISS_INDEX_PATH,
    PROJECTS_FAISS_INDEX_PATH,
    EMBEDDINGS_MODEL_NAME,
    UPDATE_INTERVAL_DAYS,
    DB_NAME
)
from utils.db_utils import get_mongodb_client, get_last_update_info, save_last_update_info

logger = logging.getLogger(__name__)

def load_projects():
    """Load projects from JSON file and create vector store"""
    try:
        if os.path.exists(PROJECTS_FAISS_INDEX_PATH+".pkl"):
            logger.info("Projects vector store already exists")
            return

        if not os.path.exists("codedex_projects.json"):
            logger.warning("codedex_projects.json not found")
            return
            
        with open("codedex_projects.json", "r", encoding ="utf-8") as f:
            projects_data = json.load(f)
        
        documents = []
        for project in projects_data:
            # Extract searchable content
            content = f"Title: {project.get('title', '')}\n"
            content += f"Tags: {', '.join(project.get('tags', []))}\n"
            
            # Extract text from checkpoints to make searchable
            for checkpoint in project.get('checkpoints', []):
                content += f"Checkpoint: {checkpoint.get('checkpoint', '')}\n"
                for item in checkpoint.get('content', []):
                    if item.get('type') == 'p':
                        content += f"{item.get('text', '')}\n"
                    elif item.get('type') == 'pre':
                        content += f"Code: {item.get('text', '')}\n"
            
            doc = Document(page_content=content, metadata=project)
            documents.append(doc)
        
        logger.info(f"Loaded {len(documents)} projects")
        
        # Create vector store
        embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL_NAME)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        split_docs = text_splitter.split_documents(documents)
        
        vector_store = FAISS.from_documents(split_docs, embeddings)
        
        # Save vector store
        with open(f"{PROJECTS_FAISS_INDEX_PATH}.pkl", "wb") as f:
            pickle.dump(vector_store, f)
            
        logger.info(f"Projects vector store created with {len(documents)} documents")
        
    except Exception as e:
        logger.error(f"Failed to load projects: {str(e)}")

def get_projects_vector_store() -> FAISS:
    """Get the projects vector store"""
    if os.path.exists(f"{PROJECTS_FAISS_INDEX_PATH}.pkl"):
        logger.info("Loading existing projects FAISS index...")
        with open(f"{PROJECTS_FAISS_INDEX_PATH}.pkl", "rb") as f:
            vector_store = pickle.load(f)
        return vector_store
    else:
        load_projects()
    
    logger.info("Creating a new projects FAISS index...")
    load_projects()
    
    with open(f"{PROJECTS_FAISS_INDEX_PATH}.pkl", "rb") as f:
        vector_store = pickle.load(f)
    
    return vector_store

def refresh_resources_vector_store():
    client = get_mongodb_client()
    db = client[DB_NAME]
    collection = db.resourcesFromCommunity
    
    resources = list(collection.find())
    logger.info(f"Found {len(resources)} resources in MongoDB")
    
    if not resources:
        logger.warning("No resources found in MongoDB")
        return
    
    documents = []
    for resource in resources:
        if "_id" in resource:
            resource["_id"] = str(resource["_id"])
        
        topics = resource.get('topics', [])
        if not isinstance(topics, list):
            topics = []
            
        tags = resource.get('tags', [])
        if not isinstance(tags, list):
            tags = []
        
        content = f"Title: {resource.get('title', 'Unknown')}\n"
        content += f"Type: {resource.get('type', 'documentation')}\n"
        content += f"Topics: {', '.join(topics)}\n"
        content += f"Tags: {', '.join(tags)}\n"
        content += f"Difficulty: {resource.get('difficulty', 'beginner')}\n"
        content += f"Description: {resource.get('description', '')}\n"
        content += f"URL: {resource.get('url', '')}"
        
        doc = Document(page_content=content, metadata=resource)
        documents.append(doc)
    
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL_NAME)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    split_docs = text_splitter.split_documents(documents)
    
    vector_store = FAISS.from_documents(split_docs, embeddings)
    
    with open(f"{RESOURCES_FAISS_INDEX_PATH}.pkl", "wb") as f:
        pickle.dump(vector_store, f)
        
    logger.info(f"Resources vector store updated with {len(documents)} documents")

def refresh_questions_vector_store():
    client = get_mongodb_client()
    db = client[DB_NAME]
    collection = db.questionsFromCommunity
    
    questions = list(collection.find())
    logger.info(f"Found {len(questions)} questions in MongoDB")
    
    if not questions:
        logger.warning("No questions found in MongoDB")
        return
    
    documents = []
    for question in questions:
        if "_id" in question:
            question["_id"] = str(question["_id"])
        
        tags = question.get('tags', [])
        if not isinstance(tags, list):
            tags = []
        
        options = question.get('options', [])
        if not isinstance(options, list):
            options = []
        
        content = f"Question: {question.get('question', '')}\n"
        
        for i, option in enumerate(options):
            content += f"Option {i+1}: {option}\n"
        
        content += f"Topic: {question.get('topic', '')}\n"
        content += f"Tags: {', '.join(tags)}\n"
        content += f"Difficulty: {question.get('difficulty', 'beginner')}\n"
        
        doc = Document(page_content=content, metadata=question)
        documents.append(doc)
    
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL_NAME)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    split_docs = text_splitter.split_documents(documents)
    
    vector_store = FAISS.from_documents(split_docs, embeddings)
    
    with open(f"{QUESTIONS_FAISS_INDEX_PATH}.pkl", "wb") as f:
        pickle.dump(vector_store, f)
        
    logger.info(f"Questions vector store updated with {len(documents)} documents")

def get_resources_vector_store() -> FAISS:
    update_info = get_last_update_info()
    now = datetime.now()
    
    if now - update_info.get("resources", datetime.min) > timedelta(days=UPDATE_INTERVAL_DAYS):
        try:
            refresh_resources_vector_store()
            update_info["resources"] = now
            save_last_update_info(update_info)
        except Exception as e:
            logger.error(f"Failed to refresh resources vector store: {e}")
    
    if os.path.exists(f"{RESOURCES_FAISS_INDEX_PATH}.pkl"):
        logger.info("Loading existing resources FAISS index...")
        with open(f"{RESOURCES_FAISS_INDEX_PATH}.pkl", "rb") as f:
            vector_store = pickle.load(f)
        return vector_store
    
    logger.info("Creating a new resources FAISS index...")
    refresh_resources_vector_store()
    
    with open(f"{RESOURCES_FAISS_INDEX_PATH}.pkl", "rb") as f:
        vector_store = pickle.load(f)
    
    return vector_store

def get_questions_vector_store() -> FAISS:
    update_info = get_last_update_info()
    now = datetime.now()
    
    if now - update_info.get("questions", datetime.min) > timedelta(days=UPDATE_INTERVAL_DAYS):
        try:
            refresh_questions_vector_store()
            update_info["questions"] = now
            save_last_update_info(update_info)
        except Exception as e:
            logger.error(f"Failed to refresh questions vector store: {e}")
    
    if os.path.exists(f"{QUESTIONS_FAISS_INDEX_PATH}.pkl"):
        logger.info("Loading existing questions FAISS index...")
        with open(f"{QUESTIONS_FAISS_INDEX_PATH}.pkl", "rb") as f:
            vector_store = pickle.load(f)
        return vector_store
    
    logger.info("Creating a new questions FAISS index...")
    refresh_questions_vector_store()
    
    with open(f"{QUESTIONS_FAISS_INDEX_PATH}.pkl", "rb") as f:
        vector_store = pickle.load(f)
    
    return vector_store

def check_and_update_vector_stores():
    update_info = get_last_update_info()
    now = datetime.now()
    
    if now - update_info.get("resources", datetime.min) > timedelta(days=UPDATE_INTERVAL_DAYS):
        logger.info("Updating resources vector store...")
        try:
            refresh_resources_vector_store()
            update_info["resources"] = now
            logger.info("Resources vector store updated successfully")
        except Exception as e:
            logger.error(f"Failed to update resources vector store: {e}")
    
    if now - update_info.get("questions", datetime.min) > timedelta(days=UPDATE_INTERVAL_DAYS):
        logger.info("Updating questions vector store...")
        try:
            refresh_questions_vector_store()
            update_info["questions"] = now
            logger.info("Questions vector store updated successfully")
        except Exception as e:
            logger.error(f"Failed to update questions vector store: {e}")
    
    save_last_update_info(update_info)

def retrieve_relevant_resources(topic: str, vector_store: FAISS) -> List[Dict[str, str]]:
    retriever = vector_store.as_retriever(search_kwargs={"k": 40})
    retrieved_docs = retriever.get_relevant_documents(topic)
    retrieved_resources = []
    for doc in retrieved_docs:
            resource = doc.metadata
            
            transformed_resource = {
                "name": resource.get("title", resource.get("name", "Unknown Resource")),
                "url": resource.get("url", ""),
                "type": resource.get("type", "documentation"),
                "tags": resource.get("tags", []),
                "topics": resource.get("topics", []),
                "difficulty": resource.get("difficulty", "beginner"),
                "description": resource.get("description", "")
            }
            retrieved_resources.append(transformed_resource)
    
    seen = set()
    unique_resources = []
    for resource in retrieved_resources:
        resource_key = resource['url']
        if resource_key not in seen and resource_key:
            seen.add(resource_key)
            unique_resources.append(resource)
    
    return unique_resources[:20]

def retrieve_relevant_questions(topic: str, difficulty: str, tags: List[str], vector_store: FAISS) -> List[Dict[str, Any]]:
    query = f"Topic: {topic}, Difficulty: {difficulty}, Tags: {', '.join(tags)}"
    
    retriever = vector_store.as_retriever(search_kwargs={"k": 30})
    retrieved_docs = retriever.get_relevant_documents(query)
    
    retrieved_questions = []
    for doc in retrieved_docs:
        if doc.metadata and "question" in doc.metadata:
            retrieved_questions.append(doc.metadata)
    
    seen = set()
    unique_questions = []
    for question in retrieved_questions:
        question_key = question.get("question", "")[:100] 
        if question_key not in seen and question_key:
            seen.add(question_key)
            unique_questions.append(question)
    
    return unique_questions[:15]