import json
import logging
import re
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime

from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_core.output_parsers import JsonOutputParser

from services.llm_service import get_llm, validate_topic
from services.vector_store import get_resources_vector_store, retrieve_relevant_resources
from utils.sanitizers import sanitize_input
from models.models import Roadmap

logger = logging.getLogger(__name__)
roadmap_parser = JsonOutputParser(pydantic_object=Roadmap)

def get_global_feedback_summary() -> Dict[str, Any]:

    try:
        response = requests.get("http://localhost:5000/api/feedback/global-summary")
        response.raise_for_status()  
        return response.text
    except Exception as e:
        logger.error(f"Error fetching global feedback summary: {str(e)}")
        return {}

def parse_feedback_summary(summary_text: str) -> Dict[str, Any]:

    try:
        result = {
            "global_stats": {},
            "roadmaps": {}
        }

        global_stats_match = re.search(r'GLOBAL STATISTICS(.*?)(?=={3,}|\Z)', summary_text, re.DOTALL)
        if global_stats_match:
            global_stats_text = global_stats_match.group(1).strip()
            
            avg_rating_match = re.search(r'Overall Average Rating: ([\d.]+)/5', global_stats_text)
            if avg_rating_match:
                result["global_stats"]["average_rating"] = float(avg_rating_match.group(1))
                
            assessment_match = re.search(r'Overall Assessment: (.+)', global_stats_text)
            if assessment_match:
                result["global_stats"]["assessment"] = assessment_match.group(1).strip()
                
            roadmaps_count_match = re.search(r'Total Roadmaps with Feedback: (\d+)', global_stats_text)
            if roadmaps_count_match:
                result["global_stats"]["total_roadmaps"] = int(roadmaps_count_match.group(1))
                
            feedback_count_match = re.search(r'Total Feedback Submissions: (\d+)', global_stats_text)
            if feedback_count_match:
                result["global_stats"]["total_feedback"] = int(feedback_count_match.group(1))

        roadmap_sections = re.findall(r'={3,}\nROADMAP: (.+?)(?=={3,}|\Z)', summary_text, re.DOTALL)
        
        for roadmap_section in roadmap_sections:
            roadmap_name_match = re.match(r'([^\n]+)', roadmap_section)
            if not roadmap_name_match:
                continue
                
            roadmap_name = roadmap_name_match.group(1).strip()
            result["roadmaps"][roadmap_name] = {
                "checkpoints": {}
            }
            total_feedback_match = re.search(r'Total Feedback: (\d+)', roadmap_section)
            if total_feedback_match:
                result["roadmaps"][roadmap_name]["total_feedback"] = int(total_feedback_match.group(1))
                
            avg_rating_match = re.search(r'Average Rating: ([\d.]+)/5', roadmap_section)
            if avg_rating_match:
                result["roadmaps"][roadmap_name]["average_rating"] = float(avg_rating_match.group(1))
            
         
            checkpoint_sections = re.findall(r'CHECKPOINT \d+: (.+?)(?=CHECKPOINT|\Z)', roadmap_section, re.DOTALL)
            
            for checkpoint_section in checkpoint_sections:

                checkpoint_name_match = re.match(r'([^\n]+)', checkpoint_section)
                if not checkpoint_name_match:
                    continue
                    
                checkpoint_name = checkpoint_name_match.group(1).strip()
                
                feedback_count_match = re.search(r'Feedback Count: (\d+)', checkpoint_section)
                avg_rating_match = re.search(r'Average Rating: ([\d.]+)/5', checkpoint_section)
                assessment_match = re.search(r'Assessment: (.+)', checkpoint_section)
                
                result["roadmaps"][roadmap_name]["checkpoints"][checkpoint_name] = {
                    "feedback_count": int(feedback_count_match.group(1)) if feedback_count_match else 0,
                    "average_rating": float(avg_rating_match.group(1)) if avg_rating_match else 0,
                    "assessment": assessment_match.group(1).strip() if assessment_match else ""
                }
        
        return result
    except Exception as e:
        logger.error(f"Error parsing feedback summary: {str(e)}")
        return {"global_stats": {}, "roadmaps": {}}

def generate_roadmap(
    topic: str,
    summary: str = ""
) -> Dict[str, Any]:
    try:
        llm = get_llm()
        vector_store = get_resources_vector_store()

        sanitized_topic = sanitize_input(topic)
        validated_topic = validate_topic(sanitized_topic, llm)
        logger.info(f"Validated Topic: {validated_topic}")
        
        feedback_summary_text = get_global_feedback_summary()
        feedback_data = parse_feedback_summary(feedback_summary_text)
        
        topic_feedback = None
        for roadmap_name, roadmap_data in feedback_data.get("roadmaps", {}).items():

            if roadmap_name.lower() in validated_topic.lower() or validated_topic.lower() in roadmap_name.lower():
                topic_feedback = roadmap_data
                break
                
        retrieved_resources = retrieve_relevant_resources(validated_topic, vector_store)
        logger.info(f"Found {len(retrieved_resources)} relevant resources")
        
        feedback_info = ""
        if topic_feedback:
            feedback_info = f"""
            FEEDBACK DATA FOR SIMILAR ROADMAP:
            - Average Rating: {topic_feedback.get('average_rating', 'No data')} out of 5
            - Total Feedback Count: {topic_feedback.get('total_feedback', 'No data')}
            
            Checkpoint Feedback:
            """
            
            for checkpoint_name, checkpoint_data in topic_feedback.get("checkpoints", {}).items():
                feedback_info += f"""
                - {checkpoint_name}:
                  - Rating: {checkpoint_data.get('average_rating', 'No data')}/5
                  - Assessment: {checkpoint_data.get('assessment', 'No data')}
                """
        else:
            global_stats = feedback_data.get("global_stats", {})
            if global_stats:
                feedback_info = f"""
                GLOBAL FEEDBACK STATISTICS:
                - Overall Average Rating: {global_stats.get('average_rating', 'No data')} out of 5
                - Total Roadmaps: {global_stats.get('total_roadmaps', 'No data')}
                - Total Feedback: {global_stats.get('total_feedback', 'No data')}
                """
        
        roadmap_prompt = PromptTemplate(
            template="""
            Generate a learning roadmap with exactly 5 checkpoints for {topic}. 
            
            Each checkpoint should:
            - Have a clear, specific title.
            - Include a detailed, structured description (at least 2 lines).
            - List EXACTLY 3-4 high-quality learning resources, no more and no less.
            - The roadmap will be invalid if any checkpoint has fewer than 3 resources. 
            - Be progressively more complex.
            
            The final roadmap MUST have EXACTLY 5 checkpoints, and each checkpoint MUST have AT LEAST 3 resources.
            
            {format_instructions}
            
            Here are domain-specific resources you should use (distribute them appropriately among the checkpoints):
            Make sure of the following regarding the resources:
            - Each resource is relevant to the topic. eg a resource of 'Javascript' in a roadmap of 'java' is not relevant even though they are look similar.
            - Don't follow the sequence of resources in the prompt, use the resources as needed. 
            - Don't use resources which don't have a topics, tags, difficulty, description, url, type, name.
            - Make sure the resources are unique, no duplicates.
            - Discard resources with empty or missing fields.
            - Discard resources whose topic is not {topic}.

            {resources}
            
            {feedback_info}
 
            Make sure to tailor the roadmap to the user's learning needs and provide a clear, structured learning path.
            Here is the summary of the user's learning needs: {summary}
            
            Consider the feedback data when designing the roadmap:
            - If certain checkpoints received poor ratings, improve their content and resource selection.
            - If specific checkpoints received excellent ratings, try to maintain their structure while updating resources.
            - Pay attention to the progression difficulty - ensure it's gradual and well-paced based on feedback.
            """,
            input_variables=["topic", "resources", "summary", "feedback_info"],
            partial_variables={"format_instructions": roadmap_parser.get_format_instructions()}
        )

        example_values = {
            "topic": validated_topic,
            "resources": json.dumps(retrieved_resources[:5]),
            "summary": summary,
            "feedback_info": feedback_info
        }

        rendered_prompt = roadmap_prompt.format(**example_values)
        print(rendered_prompt)
        
        roadmap_chain = LLMChain(llm=llm, prompt=roadmap_prompt)
        result = roadmap_chain.invoke({
            "topic": validated_topic,
            "resources": json.dumps(retrieved_resources),
            "summary": summary,
            "feedback_info": feedback_info
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
                "feedback_incorporated": bool(feedback_info),
                "similar_roadmap_found": bool(topic_feedback)
            }
            
            if topic_feedback:
                roadmap_data["metadata"]["similar_roadmap"] = {
                    "name": next((name for name, data in feedback_data.get("roadmaps", {}).items() 
                                if data == topic_feedback), "Unknown"),
                    "average_rating": topic_feedback.get("average_rating"),
                    "total_feedback": topic_feedback.get("total_feedback")
                }
            

            if (not roadmap_data.get("mainTopic") or 
                not roadmap_data.get("checkpoints") or 
                len(roadmap_data.get("checkpoints", [])) != 5):
                raise ValueError("Unexpected roadmap format received.")
            
            for i, checkpoint in enumerate(roadmap_data["checkpoints"]):
                if len(checkpoint.get("resources", [])) < 3:
                    raise ValueError(f"Checkpoint {i+1} has fewer than 3 resources.")
            
            return roadmap_data
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response from LLM: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error generating roadmap: {str(e)}")
        return {"error": f"Failed to generate roadmap: {str(e)}"}