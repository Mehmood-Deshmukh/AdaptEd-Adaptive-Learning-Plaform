const axios = require('axios');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:5000/api/quiz/generate';
const DELAY_MS = 3000; // Delay between requests in milliseconds

// Import quiz configurations
const quizConfigurations = [
  // Computer Architecture
  {
    title: "Computer Architecture Fundamentals",
    topic: "Computer Architecture",
    domain: "Computer Science - Systems",
    difficulty: "Intermediate",
    tags: ["CPU", "Memory Hierarchy", "Instruction Set", "Pipelining"]
  },
  
  // Algorithms & Data Structures
  {
    title: "Algorithms and Data Structures",
    topic: "Algorithms & Data Structures",
    domain: "Computer Science - DSA",
    difficulty: "Intermediate",
    tags: ["Complexity Analysis", "Search Algorithms", "Sort Algorithms", "Data Structures"]
  },
  
  // Social Engineering
  {
    title: "Social Engineering Techniques",
    topic: "Social Engineering",
    domain: "Computer Science - Cybersecurity",
    difficulty: "Intermediate",
    tags: ["Phishing", "Pretexting", "Baiting", "Human Factors"]
  },
  
  // JavaScript
  {
    title: "Modern JavaScript Concepts",
    topic: "JavaScript",
    domain: "Computer Science - Web Development",
    difficulty: "Intermediate",
    tags: ["ES6+", "Promises", "Async/Await", "DOM Manipulation"]
  },
  
  // Cyber Security
  {
    title: "Cybersecurity Principles",
    topic: "Cyber Security",
    domain: "Computer Science - Security",
    difficulty: "Intermediate",
    tags: ["Threat Modeling", "Defense in Depth", "Security Controls", "Risk Management"]
  },
  
  // Virtual Reality
  {
    title: "Virtual Reality Technologies",
    topic: "Virtual Reality",
    domain: "Computer Science - Graphics",
    difficulty: "Advanced",
    tags: ["3D Rendering", "Spatial Computing", "VR Hardware", "Immersive Experiences"]
  },
  
  // Web Hacking
  {
    title: "Web Application Security",
    topic: "Web Hacking",
    domain: "Computer Science - Security",
    difficulty: "Advanced",
    tags: ["XSS", "CSRF", "SQL Injection", "Authentication Vulnerabilities"]
  },
  
  // Elixir
  {
    title: "Elixir Programming Language",
    topic: "Elixir",
    domain: "Computer Science - Programming Languages",
    difficulty: "Intermediate",
    tags: ["Functional Programming", "Concurrency", "Pattern Matching", "Phoenix Framework"]
  },
  
  // R
  {
    title: "R for Data Analysis",
    topic: "R",
    domain: "Computer Science - Data Science",
    difficulty: "Intermediate",
    tags: ["Data Manipulation", "Statistical Analysis", "Data Visualization", "Tidyverse"]
  },
  
  // Big Data
  {
    title: "Big Data Technologies",
    topic: "Big Data",
    domain: "Computer Science - Data Engineering",
    difficulty: "Advanced",
    tags: ["Hadoop", "Spark", "NoSQL", "Data Processing"]
  },
  
  // Artificial Neural Network
  {
    title: "Artificial Neural Networks",
    topic: "Artificial Neural Network",
    domain: "Computer Science - AI",
    difficulty: "Advanced",
    tags: ["Perceptrons", "Backpropagation", "Activation Functions", "Network Architectures"]
  },
  
  // Computer Graphics
  {
    title: "Computer Graphics Principles",
    topic: "Computer Graphics",
    domain: "Computer Science - Graphics",
    difficulty: "Advanced",
    tags: ["Rendering", "Shading", "Transformations", "3D Modeling"]
  },
  
  // Cloud Computing
  {
    title: "Cloud Computing Fundamentals",
    topic: "Cloud Computing",
    domain: "Computer Science - Systems",
    difficulty: "Intermediate",
    tags: ["IaaS", "PaaS", "SaaS", "Virtualization"]
  },
  
  // Quantum Computing
  {
    title: "Quantum Computing Basics",
    topic: "Quantum Computing",
    domain: "Computer Science - Emerging Technologies",
    difficulty: "Advanced",
    tags: ["Qubits", "Quantum Gates", "Quantum Algorithms", "Quantum Entanglement"]
  },
  
  // Machine Learning
  {
    title: "Machine Learning Fundamentals",
    topic: "Machine Learning",
    domain: "Computer Science - AI",
    difficulty: "Intermediate",
    tags: ["Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Feature Engineering"]
  },
  
  // Mathematics
  {
    title: "Mathematics for Computer Science",
    topic: "Mathematics",
    domain: "Computer Science - Theory",
    difficulty: "Intermediate",
    tags: ["Discrete Math", "Linear Algebra", "Calculus", "Probability"]
  },
  
  // Computer Networks
  {
    title: "Computer Networks Fundamentals",
    topic: "Computer Networks",
    domain: "Computer Science - Networks",
    difficulty: "Intermediate",
    tags: ["OSI Model", "TCP/IP", "Protocols", "Network Security"]
  },
  
  // Regular Expressions
  {
    title: "Regular Expressions Mastery",
    topic: "Regular Expressions",
    domain: "Computer Science - Programming",
    difficulty: "Intermediate",
    tags: ["Pattern Matching", "Quantifiers", "Character Classes", "Capture Groups"]
  },
  
  // Haskell
  {
    title: "Haskell Programming Language",
    topic: "Haskell",
    domain: "Computer Science - Programming Languages",
    difficulty: "Advanced",
    tags: ["Functional Programming", "Type System", "Monads", "Lazy Evaluation"]
  },
  
  // Computer Vision
  {
    title: "Computer Vision Techniques",
    topic: "Computer Vision",
    domain: "Computer Science - AI",
    difficulty: "Advanced",
    tags: ["Image Processing", "Object Detection", "Feature Extraction", "CNNs"]
  },
  
  // C
  {
    title: "C Programming Language",
    topic: "C",
    domain: "Computer Science - Programming Languages",
    difficulty: "Intermediate",
    tags: ["Memory Management", "Pointers", "Structures", "Low-level Programming"]
  },
  
  // Go
  {
    title: "Go Programming Language",
    topic: "Go",
    domain: "Computer Science - Programming Languages",
    difficulty: "Intermediate",
    tags: ["Concurrency", "Goroutines", "Interfaces", "Error Handling"]
  },
  
  // Signals & Systems
  {
    title: "Signals and Systems",
    topic: "Signals & Systems",
    domain: "Computer Science - Electrical Engineering",
    difficulty: "Advanced",
    tags: ["Fourier Transform", "Sampling", "Filtering", "Signal Processing"]
  },
  
  // Python
  {
    title: "Python Programming Language",
    topic: "Python",
    domain: "Computer Science - Programming Languages",
    difficulty: "Beginner",
    tags: ["Data Structures", "Functions", "OOP", "Libraries"]
  },
  
  // Data Mining
  {
    title: "Data Mining Techniques",
    topic: "Data Mining",
    domain: "Computer Science - Data Science",
    difficulty: "Advanced",
    tags: ["Pattern Recognition", "Classification", "Clustering", "Association Rules"]
  },
  
  // NoSQL
  {
    title: "NoSQL Database Systems",
    topic: "NoSQL",
    domain: "Computer Science - Databases",
    difficulty: "Intermediate",
    tags: ["Document Stores", "Key-Value Stores", "Graph Databases", "CAP Theorem"]
  },
  
  // Java
  {
    title: "Java Programming Language",
    topic: "Java",
    domain: "Computer Science - Programming Languages",
    difficulty: "Intermediate",
    tags: ["Object-Oriented Programming", "Collections", "Multithreading", "JVM"]
  },
  
  // Assembly
  {
    title: "Assembly Language Programming",
    topic: "Assembly",
    domain: "Computer Science - Programming Languages",
    difficulty: "Advanced",
    tags: ["Instructions", "Registers", "Memory Addressing", "Low-level Operations"]
  },
  
  // Cybernetics and Robotics
  {
    title: "Cybernetics and Robotics",
    topic: "Cybernetics and Robotics",
    domain: "Computer Science - Robotics",
    difficulty: "Advanced",
    tags: ["Control Systems", "Sensors", "Actuators", "Robot Kinematics"]
  },
  
  // Reverse Engineering
  {
    title: "Reverse Engineering Techniques",
    topic: "Reverse Engineering",
    domain: "Computer Science - Security",
    difficulty: "Advanced",
    tags: ["Disassembly", "Debugging", "Binary Analysis", "Decompilation"]
  },
  
  // SQL
  {
    title: "SQL Database Language",
    topic: "SQL",
    domain: "Computer Science - Databases",
    difficulty: "Intermediate",
    tags: ["Queries", "Joins", "Indexes", "Transactions"]
  },
  
  // Cryptography
  {
    title: "Cryptography Fundamentals",
    topic: "Cryptography",
    domain: "Computer Science - Security",
    difficulty: "Advanced",
    tags: ["Encryption", "Hashing", "Digital Signatures", "Key Management"]
  },
  
  // Exploits
  {
    title: "Security Exploits and Vulnerabilities",
    topic: "Exploits",
    domain: "Computer Science - Security",
    difficulty: "Advanced",
    tags: ["Buffer Overflows", "RCE", "Privilege Escalation", "Vulnerability Analysis"]
  },
  
  // Bash
  {
    title: "Bash Shell Scripting",
    topic: "Bash",
    domain: "Computer Science - Systems",
    difficulty: "Intermediate",
    tags: ["Shell Commands", "Script Automation", "Text Processing", "System Administration"]
  },
  
  // C++
  {
    title: "C++ Programming Language",
    topic: "C++",
    domain: "Computer Science - Programming Languages",
    difficulty: "Advanced",
    tags: ["Object-Oriented Programming", "STL", "Memory Management", "Templates"]
  },
  
  // Information Theory
  {
    title: "Information Theory Concepts",
    topic: "Information Theory",
    domain: "Computer Science - Theory",
    difficulty: "Advanced",
    tags: ["Entropy", "Compression", "Channel Capacity", "Coding Theory"]
  },
  
  // Natural Language Processing
  {
    title: "Natural Language Processing",
    topic: "Natural Language Processing",
    domain: "Computer Science - AI",
    difficulty: "Advanced",
    tags: ["Text Analysis", "Sentiment Analysis", "Language Models", "Named Entity Recognition"]
  },
  
  // Julia
  {
    title: "Julia Programming Language",
    topic: "Julia",
    domain: "Computer Science - Programming Languages",
    difficulty: "Intermediate",
    tags: ["Scientific Computing", "Performance", "Multiple Dispatch", "Type System"]
  },
  
  // Operating Systems
  {
    title: "Operating Systems Principles",
    topic: "Operating Systems",
    domain: "Computer Science - Systems",
    difficulty: "Intermediate",
    tags: ["Process Management", "Memory Management", "File Systems", "Scheduling"]
  },
  
  // PHP
  {
    title: "PHP Web Development",
    topic: "PHP",
    domain: "Computer Science - Web Development",
    difficulty: "Intermediate",
    tags: ["Server-side Scripting", "Forms", "Databases", "Security"]
  },
  
  // Physics
  {
    title: "Physics for Computer Science",
    topic: "Physics",
    domain: "Computer Science - Theory",
    difficulty: "Advanced",
    tags: ["Simulation", "Computational Physics", "Physical Modeling", "Quantum Mechanics"]
  },
  
  // Ruby
  {
    title: "Ruby Programming Language",
    topic: "Ruby",
    domain: "Computer Science - Programming Languages",
    difficulty: "Intermediate",
    tags: ["Object-Oriented Programming", "Blocks", "Rails", "Metaprogramming"]
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

// Main function to send requests for all quiz configurations
async function generateQuizzes() {
  console.log(`Starting to generate ${quizConfigurations.length} Computer Science quizzes...`);
  
  const results = [];
  
  for (let i = 0; i < quizConfigurations.length; i++) {
    // Get the current quiz configuration
    const quizConfig = quizConfigurations[i];
    
    // Send request
    const result = await sendQuizRequest(quizConfig);
    if (result) {
      results.push(result);
    }
    
    // Add delay between requests to avoid overwhelming the server
    await delay(DELAY_MS);
  }
  
  // Save results to file
  fs.writeFileSync('quiz_results.json', JSON.stringify(results, null, 2));
  console.log(`Generated ${results.length} quizzes. Results saved to quiz_results.json`);
}

// Run the script
generateQuizzes().catch(console.error);