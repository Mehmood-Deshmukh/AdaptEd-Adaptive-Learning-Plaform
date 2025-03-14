import { useState } from "react";
import styles from "./Survey.module.css";

const LearningStyleSurvey = () => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

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
    console.log(answers);
    try {

        // No API endpoint to submit survey results yet
        /*
        const response = await fetch(
            "http://localhost:5000/api/users/update-learning-parameters",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ answers }),
            }
        );
        const data = await response.json();

        if (response.ok) {
            alert("Survey results submitted successfully");
            navigate("/home");
        } else {
            alert(data.message);
            setAnswers({});
            setCurrentQuestion(0);
            setIsComplete(false);
        }
        */
        alert("Survey results submitted successfully");
    } catch (e) {

        console.log(e);
    }
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

  return (
    <div className={styles.surveyContainer}>
      <h1 className={styles.title}>Learning Style Assessment</h1>

      {!isComplete ? (
        <>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
            <p className={styles.questionCount}>
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          <h2 className={styles.question}>
            {questions[currentQuestion].question}
          </h2>

          <div className={styles.optionsContainer}>
            {questions[currentQuestion].options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`${styles.option} ${
                  answers[questions[currentQuestion].parameter] === option.value
                    ? styles.optionSelected
                    : ""
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>

          <div className={styles.navigationButtons}>
            <button
              onClick={handlePrevious}
              className={`${styles.button} ${
                currentQuestion === 0
                  ? styles.buttonDisabled
                  : styles.buttonSecondary
              }`}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
          </div>
        </>
      ) : (
        <div className={styles.resultsContainer}>
          <h2 className={styles.question}>Your Learning Style Profile</h2>
          {calculateResults().map((result) => (
            <div key={result.category} className={styles.resultItem}>
              <div className={styles.resultHeader}>
                <span className={styles.resultCategory}>{result.category}</span>
                <span className={styles.resultScore}>{result.score}/10</span>
              </div>
              <div className={styles.resultBar}>
                <div
                  className={styles.resultBarFill}
                  style={{ width: `${(result.score / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <button onClick={handleSubmit} className={styles.resetButton}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default LearningStyleSurvey;
