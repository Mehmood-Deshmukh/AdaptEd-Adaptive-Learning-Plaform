from flask import Blueprint, request, jsonify
import logging
from typing import List, Dict, Any
import re
import json
from services.roadmap_service import generate_roadmap
from services.llm_service import get_llm
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from utils.sanitizers import sanitize_input
from datetime import datetime
from langchain_core.output_parsers import JsonOutputParser
from models.models import Roadmap, ResourceMetadata

roadmap_parser = JsonOutputParser(pydantic_object=Roadmap)

logger = logging.getLogger(__name__)
roadmap_bp = Blueprint('roadmap', __name__)

def extract_minutes(time_str):

    if not time_str:
        return 10
    
    match = re.search(r'(\d+)', time_str)
    if match:
        return int(match.group(1))
    return 10 

def load_resources(topic):
    topic_file_mapping = {
        "python": "python.json",
        "javascript": "javascript.json", 
        "cpp": "cpp.json",
        "c++": "cpp.json",
        "ml": "ml.json",
        "machine learning": "ml.json",
        "java": "java.json",
    }
    
    file_to_load = None
    for key, filename in topic_file_mapping.items():
        if key in topic.lower():
            file_to_load = filename
            break
    
    if not file_to_load:
        file_to_load = "python.json" 
        
    try:
        with open(f"./{file_to_load}", "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading resource file: {str(e)}")
        return []
def llm_rank_resources(resources: List[Dict[str, Any]], topic: str) -> List[Dict[str, Any]]:
    try:
        llm = get_llm()
        
        simplified_resources = []
        for i, resource in enumerate(resources):
            title = resource.get('title', '')
            url = resource.get('url', '')
            reading_time = resource.get('reading_time', '')
            tags = resource.get('tags', [])
            
            content_text = ""
            for item in resource.get('content', [])[:10]:  
                if item.get('type') in ['h1', 'h2', 'p']:
                    content_text += item.get('content', '') + " "
            
            simplified_resources.append({
                "id": i,
                "title": title,
                "url": url,
                "reading_time": reading_time,
                "tags": tags,
                "content_preview": content_text[:300]  
            })
        
        ranking_prompt = PromptTemplate(
            template="""
            You are an expert educational content curator specializing in {topic}.
            
            I need you to rank the following resources from simplest/most basic (rank 1) to most complex/advanced.
            Consider these factors in your ranking:
            1. Content complexity (basic explanations → advanced concepts)
            2. Prerequisites needed (fewer → more)
            3. Reading time (shorter → longer)
            4. Target audience (beginners → experts)
            5. Depth of coverage (overview → in-depth)
            
            Here are the resources to rank:
            {resources}
            
            Analyze each resource and assign a complexity score from 1-100 (1 = absolute beginner, 100 = expert level).
            Also provide a brief explanation of why you gave this score.
            
            Return your analysis as a JSON array with this structure:
            [
              {{
                "id": resource_id,
                "complexity_score": score (1-100),
                "reasoning": "very long explanation of score atleast 5 lines i.e 100 words",
                "difficulty_level": "beginner|intermediate|advanced",
                "estimated_prerequisites": "none|basic|intermediate|advanced"
                "description": "Brief description of the content"
              }},
              ...
            ]
            
            Sort the results by complexity_score from lowest to highest.
            """,
            input_variables=["topic", "resources"]
        )
        
        ranking_chain = LLMChain(llm=llm, prompt=ranking_prompt)
        result = ranking_chain.invoke({
            "topic": topic,
            "resources": json.dumps(simplified_resources, indent=2)
        })
        
        text = result.get("text", "")
        
        json_match = re.search(r'\[[\s\S]*\]', text)
        if not json_match:
            raise ValueError("LLM did not return a valid JSON array")
        
        llm_rankings = json.loads(json_match.group(0))
        
        llm_rankings.sort(key=lambda x: x.get('complexity_score', 50))

        
        ranked_resources = []
        for i, ranking in enumerate(llm_rankings):
            resource_id = ranking.get('id')
            if resource_id < len(resources):
                resource = resources[resource_id]
                
                formatted_resource = {
                    "name": resource.get("title", ""),
                    "url": resource.get("url", ""),
                    "type": "article", 
                    "tags": resource.get("tags", []),
                    "topics": [topic], 
                    "difficulty": ranking.get("difficulty_level", "beginner"),
                    "description": ranking.get("description", ""),
                    "rank": i + 1,  
                    "reasoning": ranking.get("reasoning", ""),
                    "llm_complexity_score": ranking.get("complexity_score", 50),
                    "llm_prerequisites": ranking.get("estimated_prerequisites", "none")
                }
                
                ranked_resources.append(formatted_resource)
        
        return ranked_resources
        
    except Exception as e:
        logger.error(f"Error in LLM ranking: {str(e)}")
        
        logger.info("Falling back to rule-based ranking")
        return rule_based_rank_resources(resources, topic)
    
def rule_based_rank_resources(resources: List[Dict[str, Any]], topic: str) -> List[Dict[str, Any]]:

    scored_resources = []
    
    for i, resource in enumerate(resources):
        complexity_score = 0
        
        # Factor 1: Reading time (shorter = easier)
        reading_time = extract_minutes(resource.get('reading_time', '10 min read'))
        complexity_score += reading_time * 2  
        
        # Factor 2: Check for basic/introduction keywords in title and content
        title = resource.get('title', '').lower()
        
        basic_keywords = ['basics', 'introduction', 'beginner', 'getting started', 'under 5 mins', '101']
        advanced_keywords = ['advanced', 'expert', 'mastering', 'deep dive', 'complex', 'architecture']
        
 
        for keyword in basic_keywords:
            if keyword in title:
                complexity_score -= 20  # Reduce score for basic content
        
        for keyword in advanced_keywords:
            if keyword in title:
                complexity_score += 30  # Increase score for advanced content
                
        # Factor 3: Content structure analysis
        content = resource.get('content', [])
        h1_count = sum(1 for item in content if item.get('type') == 'h1')
        p_count = sum(1 for item in content if item.get('type') == 'p')
        
        # More h1 headers with fewer paragraphs suggests more introductory/overview content
        if h1_count > 0 and p_count / h1_count < 5:
            complexity_score -= 10
            
        # Factor 4: Relevance to topic
        tags = [tag.lower() for tag in resource.get('tags', [])]
        if topic.lower() in tags:
            complexity_score -= 15  # Prioritize on-topic resources
            
        # Add to scored resources
        scored_resources.append({
            'resource': resource,
            'score': complexity_score,
            'rank': i + 1  # Initial rank based on array position
        })
    
    # Sort by complexity score
    scored_resources.sort(key=lambda x: x['score'])
    

    ranked_resources = []
    for i, item in enumerate(scored_resources):
        resource = item['resource']
        
        formatted_resource = {
            "name": resource.get("title", ""),
            "url": resource.get("url", ""),
            "type": "article",  
            "tags": resource.get("tags", []),
            "topics": [topic],  
            "difficulty": "beginner" if i < len(scored_resources) / 3 else 
                        "advanced" if i > 2 * len(scored_resources) / 3 else 
                        "intermediate",
            "description": " ".join([item.get("content", "") for item in resource.get("content", [])[:3] 
                                   if item.get("type") == "p"])[:200] + "...",
            "rank": i + 1 ,
            "reasoning": "Based on reading time, content structure, relevance to topic, and complexity keywords."
        }
        
        ranked_resources.append(formatted_resource)
    
    return ranked_resources

def rank_resources(resources: List[Dict[str, Any]], topic: str) -> List[Dict[str, Any]]:
    try:
        return llm_rank_resources(resources, topic)
    except Exception as e:
        logger.error(f"Error in LLM ranking: {str(e)}")
        return rule_based_rank_resources(resources, topic)

@roadmap_bp.route('/api/generate-roadmap-v2', methods=['POST'])
def roadmap_endpoint_v2():
    try:
        data = request.get_json()
        
        if not data or not data.get('topic'):
            return jsonify({"error": "Missing topic parameter"}), 400
            
        topic = data.get('topic')
        summary = data.get('summary', '')
        ranking_method = data.get('ranking_method', 'llm')  
        
        sanitized_topic = sanitize_input(topic)
        
        raw_resources = load_resources(sanitized_topic)
        
        
        if ranking_method == 'rule_based':
            ranked_resources = rule_based_rank_resources(raw_resources, sanitized_topic)
            ranking_algo_name = "rule_based_v1"
        else:
            ranked_resources = llm_rank_resources(raw_resources, sanitized_topic)
            ranking_algo_name = "llm_based_v1"
        
        llm = get_llm()
        
        roadmap_prompt = PromptTemplate(
            template="""
            Generate a learning roadmap with exactly 5 checkpoints for {topic}. 
            
            Each checkpoint should:
            - Have a clear, specific title.
            - Include a detailed, structured description (at least 2 lines).
            - List EXACTLY 3-4 high-quality learning resources, no more and no less.
            - While Listing resources, include easier resources first and progressively more complex ones later.
            - The resources are already ranked based on complexity. Use resources with lower ranks for early checkpoints 
              and higher ranks for later checkpoint
            - Each resource MUST include the 'reasoning' field from the input data explaining why it was ranked this way."
            - Make sure to add nice description to each resource based on the content and title, dont mention any names in the resource descriptions
            - Include the resource's title, URL, and a brief description (2-3 lines) of the content.
            - Dont mention this in the resource description : "some name" and then "follow"
            - Make sure the first checkpoint is the easiest and has resources which can be completed in a short time i.e within an hour.
            - Be progressively more complex.
            - For each checkpoint, add What You Will Learn and What Next sections.
            - The What Next section should include a topic to do a Quiz and a challenge to complete before moving to the next checkpoint.
            The final roadmap MUST have EXACTLY 5 checkpoints, and each checkpoint MUST have AT LEAST 3 resources.
            
            {format_instructions}
            
            Here are pre-ranked domain-specific resources you should use (distribute them appropriately among the checkpoints).
            These resources have been intelligently ranked from simplest to most complex:
            {resources}
            
            Make sure to tailor the roadmap to the user's learning needs and provide a clear, structured learning path.
            Here is the summary of the user's learning needs: {summary}
            """,
            input_variables=["topic", "resources", "summary"],
            partial_variables={"format_instructions": roadmap_parser.get_format_instructions()}
        )
        
        roadmap_chain = LLMChain(llm=llm, prompt=roadmap_prompt)
        result = roadmap_chain.invoke({
            "topic": sanitized_topic,
            "resources": json.dumps(ranked_resources),
            "summary": summary
        })

        
        try:
            text = result.get("text", "")
            json_text = re.search(r'```(?:json)?\n?(.*?)```', text, re.DOTALL)
            if json_text:
                text = json_text.group(1)
            else:
                text = text.strip()
            
            roadmap_data = json.loads(text)

            
            roadmap_data["metadata"] = {
                "generated_at": datetime.now().isoformat(),
                "ranking_algorithm": ranking_algo_name,
                "resource_count": len(ranked_resources)
            }
            
            if (not roadmap_data.get("mainTopic") or 
                not roadmap_data.get("checkpoints") ):
                raise ValueError("Unexpected roadmap format received.")
            
            return jsonify(roadmap_data), 200
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response from LLM: {str(e)}")
            
    except Exception as e:
        logger.error(f"Endpoint error: {str(e)}")
        return jsonify({"error": f"Failed to process request: {str(e)}"}), 500

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