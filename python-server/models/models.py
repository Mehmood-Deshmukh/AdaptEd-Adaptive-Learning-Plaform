from pydantic import BaseModel, Field
from typing import List, Dict, Any

class Resource(BaseModel):
    name: str = Field(description="Name of the resource")
    url: str = Field(description="URL of the resource")
    type: str = Field(description="Type of resource (documentation, video, tutorial, course, github)")
    tags: List[str] = Field(description="List of relevant tags for the resource")
    topics: List[str] = Field(description="List of topics covered by the resource")
    difficulty: str = Field(description="Difficulty level: beginner, intermediate, or advanced")
    description: str = Field(description="A brief description of what this resource covers")
    rank: int = Field(description="Rank of the resource based on quality and relevance to the topic")
    reasoning: str = Field(description="Reasoning for the rank assigned to the resource")

class ResourceMetadata(BaseModel):
    title: str = Field(description="The title of the resource")
    url: str = Field(description="The URL of the resource")
    type: str = Field(description="The type of resource (e.g., course, tutorial, reference, documentation)")
    tags: List[str] = Field(description="List of relevant tags for the resource")
    topics: List[str] = Field(description="List of topics covered by the resource")
    difficulty: str = Field(description="Difficulty level: beginner, intermediate, or advanced")
    description: str = Field(description="A brief description of what this resource covers")
    reasoning: str = Field(description="Reasoning for the rank assigned to the resource")


class Checkpoint(BaseModel):
    title: str = Field(description="Clear, specific title for the checkpoint")
    description: str = Field(description="Detailed description of at least 2 lines")
    resources: List[Resource] = Field(description="3-4 high-quality learning resources")
    totalHoursNeeded: float = Field(description="Total hours needed for this checkpoint")
    whatYouWillLearn: List[str] = Field(description="List of skills or concepts learned in this checkpoint")
    whatNext: str = Field(description="Description of what quiz or challenge to do after this checkpoint and before the next one")

class Roadmap(BaseModel):
    mainTopic: str = Field(description="Main learning topic")
    description: str = Field(description="Description of the roadmap")
    checkpoints: List[Checkpoint] = Field(description="Exactly 5 progressively complex checkpoints")

class QuizQuestion(BaseModel):
    question: str = Field(description="Clear and concise question text")
    options: List[str] = Field(description="Four possible answer options")
    correctOption: str = Field(description="Index of the correct answer (A-D)")
    explanation: str = Field(description="Explanation of why the correct answer is right")

class Quiz(BaseModel):
    title: str = Field(description="Title of the quiz")
    topic: str = Field(description="Main topic of the quiz")
    difficulty: str = Field(description="Difficulty level: beginner, intermediate, or advanced")
    tags: List[str] = Field(description="List of relevant tags for the quiz")
    questions: List[QuizQuestion] = Field(description="List of 10 questions for the quiz")

class Project(BaseModel):
    title: str = Field(description="Title of the project")
    link: str = Field(description="URL of the project")
    tags: List[str] = Field(description="List of tags related to the project")
    description: str = Field(description="A brief description of the project")
    content: Dict[str, Any] = Field(description="Project content including code samples and instructions")