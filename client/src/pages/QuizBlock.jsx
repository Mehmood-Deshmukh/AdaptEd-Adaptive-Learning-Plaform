import { useState, useEffect } from "react";

const QuizBlock = ({ questions, quizId }) => {
  const questionsArray = Array.isArray(questions) ? questions : Object.values(questions);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [score, setScore] = useState(null); // Store the quiz score

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleOptionChange = (optIndex) => {
    setSelectedOptionIndex(optIndex);
  };

   const handleNext = () => {
    if (selectedOptionIndex !== null) {
      const answerLetter = String.fromCharCode(65 + selectedOptionIndex);
      setAnswers((prevAnswers) => [...prevAnswers, answerLetter]);

      if (currentQuestionIndex < questionsArray.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setSelectedOptionIndex(null);
      } else {
        handleSubmit();
      }
    }
  };


  // const getScore = async () => {
  //   if (!userId) {
  //     console.error("User ID not available for fetching score");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quiz/quiz-results/${userId}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch quiz score");
  //     }

  //     const data = await response.json();

  //   const firstResult = data.quizResults?.[0]?.[0]; // Access first object in first array
  //   const score = firstResult?.score ?? "Score not available";

  //   setScore(score);
  //     console.log("Quiz score:", data);
  //   } catch (error) {
  //     console.error("Error in getting quiz score:", error);
  //   }
  // };

  const handleSubmit = async () => {
    if (!userId) {
      console.error("User ID not available");
      return;
    }

    console.log("Final Answers:", answers);
    console.log("Quiz ID:", quizId);

    if (quizId.length === 0 || answers.length !== questionsArray.length) {
      console.error("Quiz ID or Answers missing!");
      return;
    }

    setIsSubmitted(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ quizId, answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      const data = await response.json();
      console.log("Quiz submitted successfully:", data);
      console.log("score : ",data.attempt.score);

      setScore(data.attempt.score);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const currentQuestion = questionsArray[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        {!isSubmitted ? (
          <>
            <p className="text-gray-600 text-sm">
              Question {currentQuestionIndex + 1} of {questionsArray.length}
            </p>
            <h2 className="text-xl font-semibold text-gray-800 mt-2">
              {currentQuestion.question}
            </h2>

            <div className="mt-4 space-y-2">
              {currentQuestion.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`p-2 rounded-md cursor-pointer transition border ${
                    selectedOptionIndex === optIndex
                      ? "bg-blue-200"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => handleOptionChange(optIndex)}
                >
                  <input
                    type="radio"
                    id={`option-${optIndex}`}
                    name="quiz-option"
                    value={option}
                    checked={selectedOptionIndex === optIndex}
                    className="hidden"
                    onChange={() => handleOptionChange(optIndex)}
                  />
                  <label htmlFor={`option-${optIndex}`} className="cursor-pointer text-black">
                    {`${String.fromCharCode(65 + optIndex)}. ${option}`}
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className={`mt-4 w-full px-6 py-2 text-white font-semibold rounded-lg transition ${
                selectedOptionIndex === null
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={selectedOptionIndex === null}
            >
              {currentQuestionIndex < questionsArray.length - 1 ? "Next" : "Submit"}
            </button>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-600">Quiz Submitted Successfully!</h2>
            {score !== null ? (
              <p className="text-lg font-semibold text-gray-800 mt-2">Your Score: {score}</p>
            ) : (
              <p className="text-gray-500">Fetching your score...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBlock;
