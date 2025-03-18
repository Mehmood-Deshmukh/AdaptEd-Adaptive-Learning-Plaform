import os
import json
import time
import random
import re
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_groq import ChatGroq
from langchain.chains import LLMChain
from dotenv import load_dotenv
from collections import deque
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Check for API key early to prevent issues
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("Error: GROQ_API_KEY environment variable is not set.")

# Define the resource metadata model
class ResourceMetadata(BaseModel):
    title: str = Field(description="The title of the resource")
    url: str = Field(description="The URL of the resource")
    type: str = Field(description="The type of resource (e.g., course, tutorial, reference, documentation)")
    tags: List[str] = Field(description="List of relevant tags for the resource")
    topics: List[str] = Field(description="List of topics covered by the resource")
    difficulty: str = Field(description="Difficulty level: beginner, intermediate, or advanced")
    description: str = Field(description="A brief description of what this resource covers")

class RateLimiter:
    """A rate limiter to ensure we don't exceed API rate limits."""
    
    def __init__(self, max_requests: int, time_window: int):
        """
        Initialize the rate limiter.
        
        Args:
            max_requests: Maximum number of requests allowed in the time window
            time_window: Time window in seconds
        """
        self.max_requests = max_requests
        self.time_window = time_window
        self.request_timestamps = deque()
    
    def wait_if_needed(self):
        """
        Wait if we're approaching the rate limit.
        Returns the wait time in seconds.
        """
        now = datetime.now()
        
        # Remove timestamps older than the time window
        while self.request_timestamps and self.request_timestamps[0] < now - timedelta(seconds=self.time_window):
            self.request_timestamps.popleft()
        
        # If we've reached the limit, wait until we can make another request
        if len(self.request_timestamps) >= self.max_requests:
            # Calculate how long to wait
            oldest_timestamp = self.request_timestamps[0]
            wait_time = (oldest_timestamp + timedelta(seconds=self.time_window) - now).total_seconds()
            if wait_time > 0:
                print(f"Rate limit reached. Waiting {wait_time:.2f} seconds...")
                time.sleep(wait_time)
                # After waiting, recursively check again to be safe
                return self.wait_if_needed()
            
        # Record this request
        self.request_timestamps.append(now)
        return 0

class ResourceMetadataGenerator:
    def __init__(self, input_file: str, output_file: str, cooldown_range: tuple = (1, 2)):
        """
        Initialize the metadata generator with input and output file paths.
        
        Args:
            input_file: Path to the input JSON file.
            output_file: Path to write the enhanced JSON with metadata.
            cooldown_range: Range of seconds to wait between API calls (min, max).
        """
        self.input_file = input_file
        self.output_file = output_file
        self.cooldown_range = cooldown_range
        
        # Set up rate limiter for Groq API (25 requests per minute)
        self.rate_limiter = RateLimiter(max_requests=25, time_window=60)

        # Initialize Groq LLM
        self.groq_llm = ChatGroq(
            model_name="llama3-70b-8192",
            temperature=0.1,
            max_tokens=2000,
            api_key=GROQ_API_KEY
        )

        # Create output parser
        self.parser = JsonOutputParser(pydantic_object=ResourceMetadata)

        # Create LLMChain for metadata generation
        self.metadata_prompt = PromptTemplate(
            template="""
            Analyze this educational resource and provide detailed metadata:
            
            Resource Title: {title}
            Resource URL: {url}
            Category: {category}
            
            Return a JSON object with detailed metadata about this resource.
            
            {format_instructions}

            dont provide any notes or comments, its fine if you make educated guesses
            just provide me a json object no text or anything else, no thanks or thank you
            """,
            input_variables=["title", "url", "category"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )

        self.metadata_chain = LLMChain(llm=self.groq_llm, prompt=self.metadata_prompt)

    def load_data(self) -> Dict[str, List[Dict[str, str]]]:
        """Load the resource data from the input JSON file."""
        try:
            with open(self.input_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: Input file '{self.input_file}' not found.")
            return {}
        except json.JSONDecodeError:
            print(f"Error: Failed to decode JSON from '{self.input_file}'.")
            return {}

    def save_data(self, data: Dict[str, List[Dict[str, Any]]]) -> None:
        """Save the enhanced data to the output JSON file."""
        with open(self.output_file, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Enhanced data saved to '{self.output_file}'.")

    def parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Extract and parse JSON from the model response."""
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            match = re.search(r'```json\n?(.*?)```', response_text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass
            
            # Try once more without assuming code blocks
            clean_text = response_text.strip()
            if clean_text.startswith("{") and clean_text.endswith("}"):
                try:
                    return json.loads(clean_text)
                except json.JSONDecodeError:
                    pass
                    
        raise ValueError("Error: Failed to extract valid JSON from response.")

    def generate_metadata(self, category: str, resource: Dict[str, str]) -> Dict[str, Any]:
        """
        Generate metadata for a resource using LLMChain.
        
        Args:
            category: The category of the resource (e.g., "computer_architecture").
            resource: The resource data with title and URL.
            
        Returns:
            Enhanced resource data with metadata.
        """
        # Wait if necessary to respect rate limits
        self.rate_limiter.wait_if_needed()
        
        try:
            # Generate metadata using LLMChain
            result = self.metadata_chain.invoke({
                "title": resource["title"],
                "url": resource["url"],
                "category": category
            })

            # Extract text response
            text = result.get("text", "").strip()
            if not text:
                raise ValueError("Empty response from LLM.")

            print(f"Metadata generated for {resource['title']}")

            text = text.replace("```json", "").replace("```", "").strip()

            # Parse and return the metadata
            metadata = self.parse_json_response(text)
            
            # Merge original resource with new metadata
            enhanced_resource = resource.copy()
            enhanced_resource.update(metadata)
            return enhanced_resource

        except Exception as e:
            print(f"Error processing {resource['title']}: {str(e)}")
            print(f"Raw response: {text if 'text' in locals() else 'No response'}")
            return resource  # Return the original resource if there's an error

    def process_resources(self) -> None:
        """Process all resources to add metadata."""
        data = self.load_data()
        if not data:
            print("No data to process.")
            return
        
        enhanced_data = {}
        total_resources = sum(len(resources) for resources in data.values())
        processed = 0
        errors = 0
        
        # To allow for resumable processing, we'll save progress periodically
        save_interval = 10
        
        start_time = time.time()

        for category, resources in data.items():
            if category not in enhanced_data:
                enhanced_data[category] = []
                
            for resource in resources:
                processed += 1
                print(f"Processing {processed}/{total_resources}: {resource['title']}")

                try:
                    # Generate metadata
                    enhanced_resource = self.generate_metadata(category, resource)
                    enhanced_data[category].append(enhanced_resource)
                except Exception as e:
                    print(f"Failed to process resource '{resource['title']}': {str(e)}")
                    enhanced_data[category].append(resource)
                    errors += 1

                # Add a small cooldown between requests for stability
                if processed < total_resources:
                    cooldown = random.uniform(*self.cooldown_range)
                    time.sleep(cooldown)
                
                # Save progress periodically
                if processed % save_interval == 0:
                    self.save_data(enhanced_data)
                    elapsed = time.time() - start_time
                    rate = processed / elapsed if elapsed > 0 else 0
                    estimated_time = (total_resources - processed) / rate if rate > 0 else 0
                    print(f"Progress saved. Processing rate: {rate:.2f} resources/second")
                    print(f"Estimated time remaining: {estimated_time/60:.2f} minutes")

        self.save_data(enhanced_data)
        
        # Calculate and display statistics
        elapsed_time = time.time() - start_time
        print(f"Processing complete in {elapsed_time/60:.2f} minutes.")
        print(f"Total resources: {total_resources}, Processed: {processed}, Errors: {errors}")

def main():
    input_file = "resources.json"
    output_file = "updated-resources-2.json"

    # Ensure input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        return

    generator = ResourceMetadataGenerator(input_file, output_file)
    generator.process_resources()

if __name__ == "__main__":
    main()