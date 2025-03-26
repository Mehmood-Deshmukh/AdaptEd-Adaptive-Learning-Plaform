import json
import logging
import re
from typing import Dict, Any, List

from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_core.output_parsers import JsonOutputParser

from services.llm_service import get_llm, validate_topic
from services.vector_store import get_questions_vector_store, retrieve_relevant_questions
from utils.sanitizers import sanitize_input
from models.models import Quiz

logger = logging.getLogger(__name__)
quiz_parser = JsonOutputParser(pydantic_object=Quiz)

def generate_quiz(
    topic: str,
    domain: str,
    difficulty: str,
    tags: List[str]
) -> Dict[str, Any]:
    try:
        llm = get_llm()
        vector_store = get_questions_vector_store()
        
        sanitized_topic = sanitize_input(topic)
        validated_topic = validate_topic(sanitized_topic, llm)
        logger.info(f"Validated Quiz Topic: {validated_topic}")
        
        retrieved_questions = retrieve_relevant_questions(
            validated_topic, 
            difficulty, 
            tags,
            vector_store
        )
        logger.info(f"Found {len(retrieved_questions)} relevant questions")
        
        quiz_prompt = PromptTemplate(
            template="""
            Generate a quiz titled "Quiz on {topic}" with exactly 10 questions.
            
            Each question should:
            - Be clear and concise
            - Have exactly 4 answer options
            - Clearly indicate the correct answer
            - Include an explanation for why the correct answer is right
            
            The quiz should match the following criteria:
            - Topic: {topic}
            - Domain: {domain}
            - Difficulty: {difficulty}
            - Tags: {tags}
            
            {format_instructions}
            
            Here are some relevant questions you can use as reference or include directly (modify as needed):
            {questions}
            
            Make sure the quiz covers different aspects of the topic and provides a good assessment of knowledge.
            """,
            input_variables=["topic", "domain", "difficulty", "tags", "questions"],
            partial_variables={"format_instructions": quiz_parser.get_format_instructions()}
        )
        
        quiz_chain = LLMChain(llm=llm, prompt=quiz_prompt)
        result = quiz_chain.invoke({
            "topic": validated_topic,
            "domain": domain,
            "difficulty": difficulty,
            "tags": json.dumps(tags),
            "questions": json.dumps(retrieved_questions)
        })
        
        try:
            text = result.get("text", "")
            json_text = re.search(r'```(?:json)?\n?(.*?)```', text, re.DOTALL)
            if json_text:
                text = json_text.group(1)
            else:
                text = text.strip()
            
            quiz_data = json.loads(text)
            
            if (not quiz_data.get("title") or 
                not quiz_data.get("questions") or 
                len(quiz_data.get("questions", [])) != 10):
                raise ValueError("Unexpected quiz format received.")
            
            for i, question in enumerate(quiz_data["questions"]):
                if (not question.get("question") or 
                    not question.get("options") or 
                    len(question.get("options", [])) != 4 or
                    "correctOption" not in question or
                    not question.get("explanation")):
                    raise ValueError(f"Question {i+1} has invalid format.")
            
            return quiz_data
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response from LLM: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error generating quiz: {str(e)}")
        return {"error": f"Failed to generate quiz: {str(e)}"}