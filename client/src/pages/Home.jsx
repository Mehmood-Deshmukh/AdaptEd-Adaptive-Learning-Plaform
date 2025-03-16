import React, { useEffect, useState } from "react";
import useAuthContext from "../hooks/useAuthContext";
import LearningStyleSurvey from "../components/SurveyComponent";
import {
  BookOpen,
  Map,
  Flame,
  Trophy,
  Crown,
  LogOut,
  User,
  Home as HomeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAuthContext();
  const { user } = state;
  const [timeOfDay, setTimeOfDay] = useState("");
  const [showSurvey, setShowSurvey] = useState(true);
  const [learningProfile, setLearningProfile] = useState(null);
  
    const Logout = async () => {
        dispatch({ type: "LOADING" });
        dispatch({ type: "LOGOUT" });
    };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 17) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");

    // Check if user has already completed the survey
    const savedProfile = localStorage.getItem("learningProfile");
    if (savedProfile) {
      setLearningProfile(JSON.parse(savedProfile));
      setShowSurvey(false);
    }
  }, []);

  // Dummy user stats
  const userStats = {
    streak: 7,
    points: 2350,
    rank: "Explorer",
    completedQuizzes: 12,
    progress: 68,
  };

  const handleSurveyClose = (results) => {
    setShowSurvey(false);
    if (results) {
      setLearningProfile(results);
      localStorage.setItem("learningProfile", JSON.stringify(results));
    }
  };

  const handleLogout = () => {
    dispatch({ type: "LOADING" });
    dispatch({ type: "LOGOUT" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white h-full shadow-lg flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-xl font-bold">AdaptEd</h2>
        </div>

        {/* User info */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="ml-3">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{userStats.rank}</p>
            </div>
          </div>

          <div className="flex justify-between text-sm mb-2">
            <div className="flex items-center">
              <Flame size={16} className="mr-1" />
              <span>{userStats.streak} days</span>
            </div>
            <div className="flex items-center">
              <Crown size={16} className="mr-1" />
              <span>{userStats.points} XP</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full"
                style={{ width: `${userStats.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="mb-1">
              <a
                onClick={() => navigate("/")}
                className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors"
              >
                <HomeIcon size={18} className="mr-3" />
                <span>Dashboard</span>
              </a>
            </div>

            {/* Generate Quiz Button */}
            <div className="mb-1">
              <a
                onClick={() => navigate("/quiz-generator")}
                className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors"
              >
                <BookOpen size={18} className="mr-3" />
                <span>Generate Quiz</span>
              </a>
            </div>

            {/* Generate Roadmap Button */}
            <div className="mb-1">
              <a
                onClick={() => navigate("/roadmap-generator")}
                className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors"
              >
                <Map size={18} className="mr-3" />
                <span>Generate Roadmap</span>
              </a>
            </div>

            {/* Forum Button */}
            <div className="mb-1">
              <a
                onClick={() => navigate("/forum")}
                className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors"
              >
                <BookOpen size={18} className="mr-3" />
                <span>Forum</span>
              </a>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Good {timeOfDay}, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Ready to continue your personalized learning journey?
            </p>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">Streak</p>
                  <Flame size={18} className="text-gray-700" />
                </div>
                <p className="text-xl font-bold mt-1 text-black">
                  {userStats.streak} days
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">XP Points</p>
                  <Crown size={18} className="text-gray-700" />
                </div>
                <p className="text-xl font-bold mt-1 text-black">
                  {userStats.points}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">Quizzes</p>
                  <Trophy size={18} className="text-gray-700" />
                </div>
                <p className="text-xl font-bold mt-1 text-black">
                  {userStats.completedQuizzes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recommended Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                <h3 className="font-medium text-black">
                  Machine Learning Fundamentals
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {learningProfile?.visualLearning > 50
                    ? "Best matched to your visual learning style"
                    : "Recommended for your profile"}
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                <h3 className="font-medium text-black">
                  Web Development Pathway
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Aligned with your current progress
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Learning Style Assessment
            </h2>
            {learningProfile ? (
              <div className="text-black">
                <p>Your learning profile has been saved! Here's a summary:</p>
                <ul className="mt-2 list-disc pl-5">
                  {learningProfile.visualLearning > 50 && (
                    <li>You're a strong visual learner</li>
                  )}
                  {learningProfile.auditoryLearning > 50 && (
                    <li>You benefit from auditory learning</li>
                  )}
                  {learningProfile.kinestheticLearning > 50 && (
                    <li>You learn best through hands-on activities</li>
                  )}
                </ul>
                <button
                  onClick={() => setShowSurvey(true)}
                  className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Retake Assessment
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSurvey(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Start Assessment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Learning Style Survey Modal */}
      {showSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              Learning Style Assessment
            </h2>
            <LearningStyleSurvey onClose={handleSurveyClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
