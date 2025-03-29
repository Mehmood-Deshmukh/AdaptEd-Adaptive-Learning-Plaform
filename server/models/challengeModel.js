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
    const prompt = `You are a coding challenge generator, who is famous for creating coding challenges that blend real life scenarios with coding problems. create a coding challenge for the topic ${topic}. The challenge should hook the user to the problem and should not overcomplicate the problem. The challenge should be simple and easy to understand. The challenge should be a real life scenario that can be solved using coding. The challenge should be suitable for a beginner level coder.
    MAKE SURE REQUIRED CODE OR DRIVER CODE DOESN'T REQUIRE ANY EXTERNAL LIBRARIES OR PACKAGES.
    only return the json in following format and nothing else dont even generate markdown or any other format, the code should produce single line or word as output it should not be too hard to compare and evaluate:
    "idealSolution" should be the ideal solution to the problem and should be in ${language}.
    The driver code should be in ${language}. 
    user should be expected to write a function and you should mention the name of the function in the description properly.
    driver code should be the code which works with the function it should not contain the solution it should contain the code which will test the function. given that required function is prepended by the user.
    For JavaScript, make sure to use console.log for output.
    you dont need to include the function name in the driver code. for ex. 
    function function_name() //user's code here SHOULD NOT BE IN DRIVER'S CODE
    The output should be a single line or word. The json should be in following format:
    {
        "title": "string",
        "description": "string",
        "driverCode": "string",
        "idealSolution": "string",
        "expectedOutput": "string",
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