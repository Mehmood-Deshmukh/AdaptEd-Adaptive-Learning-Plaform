const axios = require('axios');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:5000/api/quiz/generate';
const NUM_REQUESTS = 50; // Number of requests to send
const DELAY_MS = 3000; // Delay between requests in milliseconds

// Computer Science quiz data
const csQuizConfigurations = [
  // Programming Languages
  {
    title: "Python Programming Essentials",
    topic: "Python",
    domain: "Computer Science - Programming Languages",
    difficulty: "Beginner",
    tags: ["Python", "Data Types", "Control Flow", "Functions"]
  },
  {
    title: "Advanced Java Concepts",
    topic: "Java",
    domain: "Computer Science - Programming Languages",
    difficulty: "Advanced",
    tags: ["Java", "Multithreading", "Collections", "Generics"]
  },
  {
    title: "JavaScript and Modern Web Development",
    topic: "JavaScript",
    domain: "Computer Science - Web Development",
    difficulty: "Intermediate",
    tags: ["JavaScript", "DOM", "Async Programming", "ES6+"]
  },
  {
    title: "C++ Programming Fundamentals",
    topic: "C++",
    domain: "Computer Science - Programming Languages",
    difficulty: "Intermediate",
    tags: ["C++", "Memory Management", "STL", "Templates"]
  },
  
  // Data Structures
  {
    title: "Basic Data Structures",
    topic: "Data Structures",
    domain: "Computer Science - DSA",
    difficulty: "Beginner",
    tags: ["Arrays", "Linked Lists", "Stacks", "Queues"]
  },
  {
    title: "Advanced Data Structures",
    topic: "Data Structures",
    domain: "Computer Science - DSA",
    difficulty: "Advanced",
    tags: ["Trees", "Graphs", "Heaps", "Hash Tables"]
  },
  {
    title: "Self-Balancing Trees",
    topic: "Data Structures",
    domain: "Computer Science - DSA",
    difficulty: "Advanced",
    tags: ["AVL Trees", "Red-Black Trees", "B-Trees", "Splay Trees"]
  },
  
  // Algorithms
  {
    title: "Sorting Algorithms",
    topic: "Algorithms",
    domain: "Computer Science - DSA",
    difficulty: "Intermediate",
    tags: ["QuickSort", "MergeSort", "HeapSort", "Complexity Analysis"]
  },
  {
    title: "Graph Algorithms",
    topic: "Algorithms",
    domain: "Computer Science - DSA",
    difficulty: "Advanced",
    tags: ["DFS", "BFS", "Dijkstra", "A*"]
  },
  {
    title: "Dynamic Programming",
    topic: "Algorithms",
    domain: "Computer Science - DSA",
    difficulty: "Advanced",
    tags: ["Memoization", "Tabulation", "Optimal Substructure", "Overlapping Subproblems"]
  },
  
  // Database Systems
  {
    title: "SQL Fundamentals",
    topic: "SQL",
    domain: "Computer Science - Databases",
    difficulty: "Beginner",
    tags: ["SELECT", "JOIN", "GROUP BY", "Indexes"]
  },
  {
    title: "Database Design Principles",
    topic: "Database Design",
    domain: "Computer Science - Databases",
    difficulty: "Intermediate",
    tags: ["Normalization", "ER Diagrams", "Schema Design", "Constraints"]
  },
  {
    title: "NoSQL Database Systems",
    topic: "NoSQL",
    domain: "Computer Science - Databases",
    difficulty: "Intermediate",
    tags: ["Document Stores", "Key-Value Stores", "Graph Databases", "CAP Theorem"]
  },
  
  // Operating Systems
  {
    title: "Operating System Fundamentals",
    topic: "Operating Systems",
    domain: "Computer Science - Systems",
    difficulty: "Intermediate",
    tags: ["Process Management", "Memory Management", "File Systems", "I/O"]
  },
  {
    title: "Concurrency and Parallelism",
    topic: "Operating Systems",
    domain: "Computer Science - Systems",
    difficulty: "Advanced",
    tags: ["Threads", "Synchronization", "Deadlocks", "Race Conditions"]
  },
  
  // Software Engineering
  {
    title: "Object-Oriented Design",
    topic: "OOP",
    domain: "Computer Science - Software Engineering",
    difficulty: "Intermediate",
    tags: ["Encapsulation", "Inheritance", "Polymorphism", "Design Patterns"]
  },
  {
    title: "Software Development Lifecycle",
    topic: "SDLC",
    domain: "Computer Science - Software Engineering",
    difficulty: "Beginner",
    tags: ["Requirements", "Design", "Testing", "Deployment"]
  },
  {
    title: "Agile Development Methodologies",
    topic: "Agile",
    domain: "Computer Science - Software Engineering",
    difficulty: "Intermediate",
    tags: ["Scrum", "Kanban", "User Stories", "Sprints"]
  },
  
  // Computer Networks
  {
    title: "Computer Networking Basics",
    topic: "Networks",
    domain: "Computer Science - Networks",
    difficulty: "Beginner",
    tags: ["OSI Model", "TCP/IP", "Routing", "Switching"]
  },
  {
    title: "Network Security Principles",
    topic: "Network Security",
    domain: "Computer Science - Networks",
    difficulty: "Advanced",
    tags: ["Encryption", "Firewalls", "Authentication", "Threats"]
  },
  
  // Web Development
  {
    title: "Frontend Web Technologies",
    topic: "Frontend",
    domain: "Computer Science - Web Development",
    difficulty: "Intermediate",
    tags: ["HTML5", "CSS3", "JavaScript", "Responsive Design"]
  },
  {
    title: "Backend Development Concepts",
    topic: "Backend",
    domain: "Computer Science - Web Development",
    difficulty: "Intermediate",
    tags: ["APIs", "Authentication", "Databases", "Server Architecture"]
  },
  {
    title: "RESTful API Design",
    topic: "APIs",
    domain: "Computer Science - Web Development",
    difficulty: "Intermediate",
    tags: ["REST", "HTTP Methods", "Status Codes", "Resource Design"]
  },
  
  // Artificial Intelligence
  {
    title: "Machine Learning Fundamentals",
    topic: "Machine Learning",
    domain: "Computer Science - AI",
    difficulty: "Intermediate",
    tags: ["Supervised Learning", "Unsupervised Learning", "Features", "Models"]
  },
  {
    title: "Deep Learning Concepts",
    topic: "Deep Learning",
    domain: "Computer Science - AI",
    difficulty: "Advanced",
    tags: ["Neural Networks", "CNNs", "RNNs", "Backpropagation"]
  }
];

// Function to send a single request
async function sendQuizRequest(quizData) {
  try {
    const response = await axios.post(API_URL, quizData);
    console.log(`Quiz "${quizData.title}" created successfully!`);
    return response.data;
  } catch (error) {
    console.error(`Error creating quiz "${quizData.title}":`, error.response?.data || error.message);
    return null;
  }
}

// Function to add delay between requests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to send multiple requests
async function generateQuizzes() {
  console.log(`Starting to generate ${NUM_REQUESTS} Computer Science quizzes...`);
  
  const results = [];
  
  for (let i = 0; i < NUM_REQUESTS; i++) {
    // Select a configuration (with wrap-around if we have more requests than configurations)
    const configIndex = i % csQuizConfigurations.length;
    let quizConfig = csQuizConfigurations[configIndex];
    
    // Add a unique identifier to prevent duplicate titles
    quizConfig = {
      ...quizConfig,
      title: `${quizConfig.title} #${Math.floor(i / csQuizConfigurations.length) + 1}`
    };
    
    // Send request
    const result = await sendQuizRequest(quizConfig);
    if (result) {
      results.push(result);
    }
    
    // Add delay between requests to avoid overwhelming the server
    if (i < NUM_REQUESTS - 1) {
      await delay(DELAY_MS);
    }
  }
  
  // Save results to file
  fs.writeFileSync('quiz_results.json', JSON.stringify(results, null, 2));
  console.log(`Generated ${results.length} quizzes. Results saved to quiz_results.json`);
}

// Run the script
generateQuizzes().catch(console.error);