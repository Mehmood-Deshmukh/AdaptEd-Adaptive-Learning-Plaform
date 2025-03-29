import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Lightbulb, Loader, PenLine, CheckCircle, RotateCcw, BarChart4, Award, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Sidebar from '../components/Sidebar';
import useAuthContext from '../hooks/useAuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI('AIzaSyB8UqNYSxTM9tgt2IJ3X_eeMb7J3SeYNok');

function SubjectiveAnswers() {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [evaluationMetrics, setEvaluationMetrics] = useState(null);
  const [strengths, setStrengths] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [loading, setLoading] = useState({ question: false, evaluation: false });
  const [step, setStep] = useState(1); // 1: Topic, 2: Question & Answer, 3: Evaluation
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { state } = useAuthContext();
  const { user } = state;

  const generateQuestion = async (topic) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Generate a challenging but easy subjective question about ${topic}. The question should be thought-provoking and encourage a detailed response.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating question:', error);
      throw error;
    }
  };

  const evaluateAnswer = async (question, answer) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Question: ${question}\n\ My Answer: ${answer}\n\nInstead of detailed text feedback, provide a concise evaluation with:
      
      1. STRENGTHS_AND_WEAKNESSES: Provide an array of 3-5 short bullet points (max 15 words each) about strengths, and another array of 3-5 short bullet points about areas to improve. Format as a valid JSON object with "strengths" and "improvements" arrays.
      
      2. METRICS: Provide a JSON object with numerical ratings on a scale of 1-10 for the following metrics:
      {
        "accuracy": [score 1-10],
        "completeness": [score 1-10],
        "criticalThinking": [score 1-10],
        "clarity": [score 1-10],
        "overallScore": [score 1-10]
      }
      
      Make sure all JSON is valid and properly formatted. Use this format:
      
      {
        "feedbackPoints": {
          "strengths": ["point 1", "point 2", "point 3"],
          "improvements": ["point 1", "point 2", "point 3"]
        },
        "metrics": {
          "accuracy": 8,
          "completeness": 7,
          "criticalThinking": 9,
          "clarity": 8,
          "overallScore": 8
        }
      }`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const fullText = response.text();
      
      // Extract the JSON from the response
      try {
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const json = JSON.parse(jsonMatch[0]);
          return {
            strengths: json.feedbackPoints.strengths,
            improvements: json.feedbackPoints.improvements,
            metrics: json.metrics
          };
        }
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
      }
      
      // Fallback if JSON parsing fails
      return {
        strengths: ["Good effort"],
        improvements: ["More detail needed"],
        metrics: {
          accuracy: 5,
          completeness: 5,
          criticalThinking: 5,
          clarity: 5,
          overallScore: 5
        }
      };
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw error;
    }
  };

  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading({...loading, question: true});
    try {
      const generatedQuestion = await generateQuestion(topic);
      setQuestion(generatedQuestion);
      setStep(2);
    } catch (error) {
      alert('Failed to generate question. Please try again.');
    } finally {
      setLoading({...loading, question: false});
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    setLoading({...loading, evaluation: true});
    try {
      const result = await evaluateAnswer(question, answer);
      setEvaluationMetrics(result.metrics);
      setStrengths(result.strengths);
      setImprovements(result.improvements);
      setStep(3);
      // Show celebration animation if score is good
      if (result.metrics && result.metrics.overallScore >= 7) {
        setTimeout(() => setShowCelebration(true), 500);
        setTimeout(() => setShowCelebration(false), 3500);
      }
    } catch (error) {
      alert('Failed to evaluate answer. Please try again.');
    } finally {
      setLoading({...loading, evaluation: false});
    }
  };

  const resetApp = () => {
    setTopic('');
    setQuestion('');
    setAnswer('');
    setEvaluationMetrics(null);
    setStrengths([]);
    setImprovements([]);
    setStep(1);
  };

  // Progress bar calculation
  const getMetricColor = (score) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Progress bar text color
  const getTextColor = (score) => {
    if (score >= 8) return 'text-green-700';
    if (score >= 6) return 'text-yellow-700';
    return 'text-red-700';
  };

  const renderMetricsModal = () => {
    if (!evaluationMetrics) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowMetricsModal(false)}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <BarChart4 className="mr-2" /> Performance Dashboard
          </h3>
          
          {Object.entries(evaluationMetrics).map(([key, value]) => (
            <div key={key} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <span className={`text-sm font-medium ${getTextColor(value)}`}>{value}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${getMetricColor(value)}`} 
                  style={{ width: `${value * 10}%`, transition: 'width 1s ease-in-out' }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {key === 'accuracy' && 'How factually correct your answer is.'}
                {key === 'completeness' && 'How thoroughly you covered all aspects of the topic.'}
                {key === 'criticalThinking' && 'How well you analyzed and evaluated the information.'}
                {key === 'clarity' && 'How clear and well-structured your answer is.'}
                {key === 'overallScore' && 'Your combined performance across all metrics.'}
              </p>
            </div>
          ))}
          
          <div className="flex justify-end mt-4">
            <button 
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              onClick={() => setShowMetricsModal(false)}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderCelebration = () => {
    if (!showCelebration) return null;
    
    return (
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 20 }}
          className="bg-green-100 border-2 border-green-500 p-6 rounded-xl shadow-xl flex items-center"
        >
          <Award size={40} className="text-green-500 mr-3" />
          <div>
            <h3 className="text-xl font-bold text-green-700">Great Job!</h3>
            <p className="text-green-600">Your answer was excellent!</p>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderFeedbackPoints = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-800 mb-3 flex items-center">
            <CheckCircle size={16} className="text-green-500 mr-2" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((point, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start"
              >
                <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-green-700 text-sm">{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="font-medium text-amber-800 mb-3 flex items-center">
            <AlertTriangle size={16} className="text-amber-500 mr-2" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {improvements.map((point, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start"
              >
                <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-amber-700 text-sm">{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderMetricsDashboard = () => {
    if (!evaluationMetrics) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900">Performance Dashboard</h3>
          <button 
            onClick={() => setShowMetricsModal(true)}
            className="text-sm text-gray-600 hover:text-black underline flex items-center"
          >
            <BarChart4 size={14} className="mr-1" /> Detailed view
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(evaluationMetrics).map(([key, value]) => (
            <motion.div
              key={key} 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: Object.keys(evaluationMetrics).indexOf(key) * 0.1 }}
              className="bg-gray-50 p-3 rounded-lg text-center"
            >
              <div className={`text-2xl font-bold ${getTextColor(value)}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-1">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 10}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className={`h-1.5 rounded-full ${getMetricColor(value)}`} 
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const content = (
    <div className="flex-1 px-6 py-8 overflow-y-auto">
      <header className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-2"
        >
          Let's see if you are thorough with the roadmap
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="text-gray-600"
        >
          Generate and answer this Question
        </motion.p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
        className="bg-white rounded-xl shadow-lg overflow-hidden max-w-3xl mx-auto border border-gray-100"
      >
        {/* Progress Steps */}
        <div className="flex justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
          {[
            { step: 1, icon: Lightbulb, label: "Topic" },
            { step: 2, icon: PenLine, label: "Answer" },
            { step: 3, icon: CheckCircle, label: "Feedback" }
          ].map((item, index) => (
            <div key={index} className={`flex items-center ${step >= item.step ? 'text-black' : 'text-gray-400'}`}>
              <motion.div 
                animate={{ 
                  backgroundColor: step >= item.step ? '#e5e7eb' : '#f9fafb',
                  scale: step === item.step ? 1.1 : 1,
                  transition: { duration: 0.3 }
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2`}
              >
                <item.icon size={16} className={step >= item.step ? 'text-black' : 'text-gray-400'} />
              </motion.div>
              <span>{item.label}</span>
              {index < 2 && (
                <div className={`h-0.5 w-50 mx-2 ${step > item.step ? 'bg-black' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleTopicSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                      What topic would you like to be questioned on?
                    </label>
                    <input
                      type="text"
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                      placeholder="e.g., Cache coherence, encapsulation..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading.question}
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition flex justify-center items-center"
                  >
                    {loading.question ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        Generating Question...
                      </>
                    ) : (
                      'Generate Question'
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <h3 className="font-medium mb-2 flex items-center">
                    <Lightbulb size={16} className="mr-2" />
                    Your Question:
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-800">
                    <ReactMarkdown>{question}</ReactMarkdown>
                  </div>
                </motion.div>
                <form onSubmit={handleAnswerSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Answer:
                    </label>
                    <textarea
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                      rows="6"
                      placeholder="Type your answer here... (Markdown is supported)"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading.evaluation}
                      className="flex-1 bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition flex justify-center items-center"
                    >
                      {loading.evaluation ? (
                        <>
                          <Loader size={16} className="animate-spin mr-2" />
                          Evaluating...
                        </>
                      ) : (
                        'Submit for Evaluation'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <h3 className="font-medium mb-2 flex items-center">
                    <Lightbulb size={16} className="mr-2" />
                    Question:
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-800">
                    <ReactMarkdown>{question}</ReactMarkdown>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <h3 className="font-medium mb-2 flex items-center">
                    <PenLine size={16} className="mr-2" />
                    Your Answer:
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-800">
                    <ReactMarkdown>{answer}</ReactMarkdown>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {evaluationMetrics && renderMetricsDashboard()}
                  {strengths.length > 0 && improvements.length > 0 && renderFeedbackPoints()}
                </motion.div>
                
                <motion.button
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={resetApp}
                  className="w-full flex justify-center items-center bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  <RotateCcw size={16} className="mr-2" /> Try Another Topic
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tips section at the bottom */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
        className="max-w-3xl mx-auto mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200"
      >
        <div className="flex items-start">
          <AlertTriangle size={20} className="text-amber-600 mr-2 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">Tips for better responses:</h3>
            <ul className="text-sm text-amber-700 list-disc pl-5 mt-1">
              <li>Be specific and provide examples when possible</li>
              <li>Consider multiple perspectives in your answer</li>
              <li>Structure your response with clear sections</li>
              <li>Use markdown formatting for better organization</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="h-[100vh] bg-white text-black flex">
      <Sidebar user={user} />
      {content}
      {showMetricsModal && renderMetricsModal()}
      {renderCelebration()}
    </div>
  );
}

export default SubjectiveAnswers;