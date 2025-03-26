import json
import logging
import re
from typing import Dict, Any, List

from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_core.output_parsers import JsonOutputParser

from services.llm_service import get_llm, validate_topic
from services.vector_store import get_resources_vector_store, retrieve_relevant_resources
from utils.sanitizers import sanitize_input
from models.models import Roadmap

logger = logging.getLogger(__name__)
roadmap_parser = JsonOutputParser(pydantic_object=Roadmap)

def generate_roadmap(
    topic: str,
    summary: str
) -> Dict[str, Any]:
    try:
        llm = get_llm()
        vector_store = get_resources_vector_store()

        sanitized_topic = sanitize_input(topic)
        validated_topic = validate_topic(sanitized_topic, llm)
        logger.info(f"Validated Topic: {validated_topic}")
        
        retrieved_resources = retrieve_relevant_resources(validated_topic, vector_store)

        logger.info(f"Found {len(retrieved_resources)} relevant resources")
        
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
            make sure of the following regarding the resources:
            - Each resource is relevant to the topic. eg a resource of 'Javascript' in a roadmap of 'java' is not relevant even though they are look similar.
            - Don't follow the sequence of resources in the prompt, use the resources as needed. 
            - dont use resources which dont have a topics, tags, difficulty, description, url, type, name.
            - make sure the resources are unique, no duplicates.
            - Discard resources with empty or missing fields.
            - Discard resources whose topic is not {topic}.

            {resources}
 
            Make sure to tailor the roadmap to the user's learning needs and provide a clear, structured learning path.
            Here is the summary of the user's learning needs: {summary}
            """,
            input_variables=["topic", "resources", "summary"],
            partial_variables={"format_instructions": roadmap_parser.get_format_instructions()}
        )
        
        roadmap_chain = LLMChain(llm=llm, prompt=roadmap_prompt)
        result = roadmap_chain.invoke({
            "topic": validated_topic,
            "resources": json.dumps(retrieved_resources),
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