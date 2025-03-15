import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { X } from "lucide-react";

const LearningStyleSurvey = ({ onClose }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const toast = useRef(null);

  const questions = [
    {
      parameter: "visualLearning",
      question:
        "How much do you rely on visual aids (diagrams, images, videos) when learning new concepts?",
      options: [
        { text: "Not at all", value: 1 },
        { text: "Slightly", value: 3 },
        { text: "Moderately", value: 5 },
        { text: "Strongly", value: 7 },
        { text: "Extremely", value: 10 },
      ],
    },
    {
      parameter: "auditoryLearning",
      question:
        "How much do you rely on auditory methods (lectures, podcasts, discussions) when learning?",
      options: [
        { text: "Not at all", value: 1 },
        { text: "Rarely", value: 3 },
        { text: "Sometimes", value: 5 },
        { text: "Often", value: 7 },
        { text: "Almost exclusively", value: 10 },
      ],
    },
    {
      parameter: "readingWritingLearning",
      question:
        "How important are reading and writing as primary learning methods for you?",
      options: [
        { text: "Not important", value: 1 },
        { text: "Slightly important", value: 3 },
        { text: "Moderately important", value: 5 },
        { text: "Very important", value: 7 },
        { text: "Extremely important", value: 10 },
      ],
    },
    {
      parameter: "kinestheticLearning",
      question:
        "How much do you benefit from hands-on or practical (kinesthetic) activities when learning?",
      options: [
        { text: "Not at all", value: 1 },
        { text: "Slightly", value: 3 },
        { text: "Moderately", value: 5 },
        { text: "Significantly", value: 7 },
        { text: "Greatly", value: 10 },
      ],
    },
    {
      parameter: "challengeTolerance",
      question:
        "How much of a challenge do you prefer in your learning materials?",
      options: [
        { text: "I prefer very simple content", value: 1 },
        { text: "I prefer slightly simple content", value: 3 },
        { text: "I like a balanced level of challenge", value: 5 },
        { text: "I prefer challenging content", value: 7 },
        { text: "I thrive on very challenging content", value: 10 },
      ],
    },
    {
      parameter: "timeCommitment",
      question:
        "How many hours per week are you willing to dedicate to learning?",
      options: [
        { text: "Very little (e.g., 1-2 hours)", value: 1 },
        { text: "Low (e.g., 3-4 hours)", value: 3 },
        { text: "Moderate (e.g., 5-6 hours)", value: 5 },
        { text: "High (e.g., 7-8 hours)", value: 7 },
        { text: "Very high (9+ hours)", value: 10 },
      ],
    },
    {
      parameter: "learningPace",
      question:
        "How quickly do you prefer to progress through new learning material?",
      options: [
        { text: "Very slowly", value: 1 },
        { text: "Somewhat slowly", value: 3 },
        { text: "Moderately paced", value: 5 },
        { text: "Somewhat quickly", value: 7 },
        { text: "Very quickly", value: 10 },
      ],
    },
    {
      parameter: "socialPreference",
      question:
        "How much do you prefer learning in collaborative or social settings rather than alone?",
      options: [
        { text: "I prefer learning alone", value: 1 },
        { text: "I lean towards solo learning", value: 3 },
        { text: "Neutral", value: 5 },
        { text: "I enjoy some collaboration", value: 7 },
        { text: "I thrive in group learning environments", value: 10 },
      ],
    },
    {
      parameter: "feedbackPreference",
      question:
        "How frequently do you prefer to receive feedback on your learning progress?",
      options: [
        { text: "Rarely or never", value: 1 },
        { text: "Occasionally", value: 3 },
        { text: "Moderately", value: 5 },
        { text: "Often", value: 7 },
        { text: "Very frequently", value: 10 },
      ],
    },
  ];

  const handleAnswer = (value) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].parameter]: value,
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setIsComplete(false);
  };

  const handleSubmit = async () => {
    try {
      // No API endpoint to submit survey results yet
      console.log("Survey results:", answers);

      // Show success toast
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Learning style profile updated successfully",
        life: 3000,
      });

      // Close modal after a brief delay
      setTimeout(() => {
        setShowModal(false);
        if (onClose) onClose(answers);
      }, 1000);
    } catch (e) {
      console.log(e);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update learning style profile",
        life: 3000,
      });
    }
  };

  const handleClose = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  const calculateResults = () => {
    const categories = {
      visualLearning: "Visual Learning",
      auditoryLearning: "Auditory Learning",
      readingWritingLearning: "Reading/Writing",
      kinestheticLearning: "Kinesthetic Learning",
      challengeTolerance: "Challenge Preference",
      timeCommitment: "Time Commitment",
      learningPace: "Learning Pace",
      socialPreference: "Social Learning",
      feedbackPreference: "Feedback Preference",
    };

    return Object.entries(answers).map(([key, value]) => ({
      category: categories[key],
      score: value,
    }));
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Toast ref={toast} position="top-right" />
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mx-4 relative">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-bold text-black">
            Learning Style Assessment
          </h2>
          <button
            onClick={handleClose}
            className="text-black hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!isComplete ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between text-sm text-black mb-2">
                  <span>
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span>
                    {Math.round(
                      ((currentQuestion + 1) / questions.length) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestion + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <h3 className="text-lg font-medium text-black mb-6">
                {questions[currentQuestion].question}
              </h3>

              <div className="space-y-3 mb-6">
                {questions[currentQuestion].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full py-3 px-4 text-left rounded-md transition-all border text-black ${
                      answers[questions[currentQuestion].parameter] ===
                      option.value
                        ? "border-black bg-gray-100"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  className={`px-4 py-2 rounded-md ${
                    currentQuestion === 0
                      ? "bg-gray-200 text-black cursor-not-allowed"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
                >
                  Skip for Now
                </button>
              </div>
            </>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-black mb-6">
                Your Learning Style Profile
              </h3>
              <div className="space-y-4 mb-6">
                {calculateResults().map((result) => (
                  <div key={result.category} className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-black">{result.category}</span>
                      <span className="text-black font-medium">
                        {result.score}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full"
                        style={{ width: `${(result.score / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
                >
                  Retake Survey
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningStyleSurvey;
