const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({
    topic: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    driverCode: {
        type: String,
        required: true
    },
    userSubmittedCode: {
        type: String,
    },
    review: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    idealSolution: {
        type: String,
        required: true
    },
    expectedOutput: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Challenge = mongoose.model('Challenge', challengeSchema);

Challenge.createChallenge = async function (topic, language = 'javascript') {
    const prompt = `You are an expert coding challenge generator who creates precise, beginner-friendly challenges with standardized outputs. Your task is to create a coding challenge on ${topic}.

STRICT OUTPUT FORMAT REQUIREMENTS:
1. Return ONLY valid JSON with the following structure - no markdown, no explanations outside the JSON:
{
  "title": "Brief, engaging title",
  "description": "Clear challenge description including explicit function name requirements and parameters",
  "driverCode": "Code that tests the solution without including the solution itself",
  "idealSolution": "Complete working solution code",
  "expectedOutput": "Exact expected console output as a string"
}

CHALLENGE CONTENT REQUIREMENTS:
- Create a real-life scenario that requires a single function to solve
- Function difficulty must be BEGINNER LEVEL
- The function name must be explicitly specified in the description
- All code must be in ${language} only
- NO external libraries or packages allowed
- Solution must be fully self-contained
- The expected output MUST be a single line or word for easy comparison

LANGUAGE-SPECIFIC REQUIREMENTS:
- For JavaScript: Use console.log() for output
- For Python: Use print() for output
- If imports are absolutely necessary, include them in BOTH driverCode and idealSolution

DRIVER CODE GUIDELINES:
- Include test case(s) that call the user's function
- DO NOT include the function definition itself (user will write this part)
- DO NOT include any imports that aren't explicitly needed
- Include ONLY code needed to test the function
- DON NOT INCLUDE FUNCTION DECLARATION AND DEFINITION 

EXAMPLE JSON STRUCTURE:
{
  "title": "Bakery Order Sorter",
  "description": "The local bakery needs help sorting their orders by number. Write a function named 'sortBakeryOrders' that takes an array of order numbers and returns them sorted in ascending order.",
  "driverCode": "const orderNumbers = [5, 3, 8, 2];\nconsole.log(sortBakeryOrders(orderNumbers).join(', '));",
  "idealSolution": "function sortBakeryOrders(orders) {\n  return orders.sort((a, b) => a - b);\n}",
  "expectedOutput": "2, 3, 5, 8"
}`;

    const result = await model.generateContent(prompt, {
        temperature: 0.5,
        maxOutputTokens: 1000,
    });

    let jsonResponse = result.response.text();
    jsonResponse = jsonResponse.trim().replace('```json', '');
    jsonResponse = jsonResponse.replace('```', '');

    const challengeData = JSON.parse(jsonResponse);
    const { title, description, driverCode, idealSolution, expectedOutput } = challengeData;

    const challenge = new this({
        topic,
        title,
        description,
        driverCode,
        idealSolution,
        expectedOutput,
        userSubmittedCode: '',
        review: '',
    });
    await challenge.save();
    return challenge;
}

Challenge.getOutput = async function (code, challengeId, language, inputs = []) {
    const timeOut = 20000;
    const challenge = await this.findById(challengeId);
    if (!challenge) {
        throw new Error('Challenge not found');
    }

    challenge.userSubmittedCode = code;
    await challenge.save();

    let extension = '.py';
    let execCommand = 'python3';

    if (language && language.toLowerCase() === 'javascript') {
        extension = '.js';
        execCommand = 'node';
    }

    const tmpFile = path.join(os.tmpdir(), `code_${Date.now()}${extension}`);
    if (!fs.existsSync(tmpFile)) {
        fs.writeFileSync(tmpFile, '');
    }

    let fullCode = '';
    fullCode = 'module.exports.repl.ignoreUndefined = true;\n';
    if (language && language.toLowerCase() === 'javascript') {
        const hasAsync = code.includes('await') || challenge.driverCode.includes('await');
        if (hasAsync) {
            fullCode = `(async () => {${code}${challenge.driverCode}})().catch(console.error);`;
        } else {
            fullCode = `${code}${challenge.driverCode}`;
        }
    } else {
        fullCode = `${code}\n${challenge.driverCode}`;
    }

    fs.writeFileSync(tmpFile, fullCode);
    // save file to tmpFile
    console.log("===========================");
    console.log(fullCode);
    console.log("===========================");

    return new Promise((resolve, reject) => {
        const childProcess = exec(`${execCommand} "${tmpFile}"`, {  // Changed 'process' to 'childProcess'
            timeout: timeOut,
            env: {
                ...process.env,
                NODE_PATH: path.join(process.cwd(), 'node_modules'),
                PYTHONPATH: process.env.PYTHONPATH || ''
            }
        }, (error, stdout, stderr) => {
            // try {
            //     fs.unlinkSync(tmpFile);
            // } catch (cleanupError) {}

            if (error) {
                const errorMessage = language?.toLowerCase() === 'javascript'
                    ? formatJavaScriptError(error, stderr)
                    : formatPythonError(error, stderr);
                reject({ error: errorMessage, stderr });
                return;
            }
            resolve({ stdout, stderr });
        });

        if (inputs && inputs.length > 0) {
            inputs.forEach(input => childProcess.stdin.write(input + '\n')); // Changed 'process' to 'childProcess'
            childProcess.stdin.end(); // Changed 'process' to 'childProcess'
        }
    });
}
function formatJavaScriptError(error, stderr) {
    const cleanError = stderr.replace(/at.*\((.*?):\d+:\d+\)/g, 'at [file]');
    return {
        type: 'Runtime Error',
        message: cleanError,
        details: error.message
    };
}

function formatPythonError(error, stderr) {
    const cleanError = stderr.replace(/File.*line \d+/g, 'Error');
    return {
        type: 'Runtime Error',
        message: cleanError,
        details: error.message
    };
}

module.exports = Challenge;