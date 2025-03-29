import React, { useState, useRef } from "react";
import { Toast } from "primereact/toast";
import useAuthContext from "../hooks/useAuthContext";

const TeacherDashboard = () => {
  const [error, setError] = useState(null);
  const toast = useRef(null);
  const { dispatch, state } = useAuthContext();
  const [activeTab, setActiveTab] = useState("insights");

  const handleLogout = () => {
    dispatch({ type: "LOADING" });
    dispatch({ type: "LOGOUT" });
  };

  const data = {
    quizScore: 5.13,
    learningStyles: [
      { label: "Visual Learning", value: 4.0 },
      { label: "Auditory Learning", value: 4.0 },
      { label: "Reading/Writing Learning", value: 9.0 },
      { label: "Kinesthetic Learning", value: 8.0 },
    ],
    parameters: [
      { label: "Challenge Tolerance", value: 8.0 },
      { label: "Time Commitment", value: 9.0 },
      { label: "Learning Pace", value: 1.0 },
      { label: "Social Preference", value: 10.0 },
      { label: "Feedback Preference", value: 10.0 },
    ],
    interests: ["Edtech", "E-learning"],
    difficulty: "Advanced",
    totalUsers: 80,
    domainInterests: ["Java", "ML"],
  };

  const ProgressBar = ({ label, value, color = "gray" }) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-md w-full">
      <h3 className="text-sm font-medium">{label}</h3>
      <div className="w-full bg-gray-300 rounded-full h-3 mt-1">
        <div
          className={`bg-${color}-800 h-3 rounded-full`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <p className="text-xs mt-1 text-gray-600">{value} / 10</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Toast ref={toast} />

      {/* Header */}
      <header className="bg-black text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Teacher Dashboard</h1>
            <p className="text-gray-300 text-xs">View user cluster summaries</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-300">
                {new Date().toISOString().slice(0, 10)}{" "}
                {new Date().toTimeString().slice(0, 8)}
              </div>
              <div className="text-white text-sm font-semibold">
                {state?.user?.name}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-white text-black rounded-md hover:bg-gray-100 text-sm font-medium cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded text-sm">
            <p>{error}</p>
          </div>
        )}

        {/* Single Card with Tabs */}
        <div className="bg-white rounded-xl mb-7 shadow-lg p-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-6 py-2 text-sm font-medium ${
                activeTab === "insights"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              } hover:text-blue-600`}
            >
              Cluster Insights 1
            </button>
            <button
              onClick={() => setActiveTab("learning")}
              className={`px-6 py-2 text-sm font-medium ${
                activeTab === "learning"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              } hover:text-blue-600`}
            >
              Learning & Survey
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === "insights" && (
              <div className="grid grid-cols-3 gap-5">
                {/* Quiz Score */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <h2 className="text-sm font-semibold">Average Quiz Score</h2>
                  <p className="text-xl font-bold text-gray-700">
                    {data.quizScore} / 10
                  </p>
                </div>

                {/* Total Users */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <h2 className="text-sm font-semibold">Total Users</h2>
                  <p className="text-xl font-bold text-gray-700">
                    {data.totalUsers}
                  </p>
                </div>

                {/* Domain Interests */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <h2 className="text-sm font-semibold">Domain Interests</h2>
                  <p className="text-xl font-bold text-gray-700">
                    {data.domainInterests.join(", ")}
                  </p>
                </div>

                {/* Interests */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md col-span-2">
                  <h2 className="text-sm font-semibold">Common Interests:</h2>
                  <p className="text-xs text-gray-700">
                    {data.interests.join(", ")}
                  </p>
                </div>

                {/* Difficulty */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <h2 className="text-sm font-semibold">Difficulty Level:</h2>
                  <p className="text-xs text-gray-700">{data.difficulty}</p>
                </div>
              </div>
            )}

            {activeTab === "learning" && (
              <div className="grid grid-cols-2 gap-6">
                {/* Learning Styles */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Learning Styles
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {data.learningStyles.map((item, idx) => (
                      <ProgressBar
                        key={idx}
                        label={item.label}
                        value={item.value}
                        color="blue"
                      />
                    ))}
                  </div>
                </div>

                {/* Survey Parameters */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Survey Parameters
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {data.parameters.map((param, idx) => (
                      <ProgressBar
                        key={idx}
                        label={param.label}
                        value={param.value}
                        color="green"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-6 py-2 text-sm font-medium ${
                activeTab === "insights"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              } hover:text-blue-600`}
            >
              Cluster Insights 1
            </button>
            <button
              onClick={() => setActiveTab("learning")}
              className={`px-6 py-2 text-sm font-medium ${
                activeTab === "learning"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              } hover:text-blue-600`}
            >
              Learning & Survey
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === "insights" && (
              <div className="grid grid-cols-3 gap-5">
                {/* Quiz Score */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <h2 className="text-sm font-semibold">Average Quiz Score</h2>
                  <p className="text-xl font-bold text-gray-700">
                    {data.quizScore} / 10
                  </p>
                </div>

                {/* Total Users */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <h2 className="text-sm font-semibold">Total Users</h2>
                  <p className="text-xl font-bold text-gray-700">
                    {data.totalUsers}
                  </p>
                </div>

                {/* Domain Interests */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <h2 className="text-sm font-semibold">Domain Interests</h2>
                  <p className="text-xl font-bold text-gray-700">
                    {data.domainInterests.join(", ")}
                  </p>
                </div>

                {/* Interests */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md col-span-2">
                  <h2 className="text-sm font-semibold">Common Interests:</h2>
                  <p className="text-xs text-gray-700">
                    {data.interests.join(", ")}
                  </p>
                </div>

                {/* Difficulty */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <h2 className="text-sm font-semibold">Difficulty Level:</h2>
                  <p className="text-xs text-gray-700">{data.difficulty}</p>
                </div>
              </div>
            )}

            {activeTab === "learning" && (
              <div className="grid grid-cols-2 gap-6">
                {/* Learning Styles */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Learning Styles
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {data.learningStyles.map((item, idx) => (
                      <ProgressBar
                        key={idx}
                        label={item.label}
                        value={item.value}
                        color="blue"
                      />
                    ))}
                  </div>
                </div>

                {/* Survey Parameters */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Survey Parameters
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {data.parameters.map((param, idx) => (
                      <ProgressBar
                        key={idx}
                        label={param.label}
                        value={param.value}
                        color="green"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("insights")}
                className={`px-6 py-2 text-sm font-medium ${
                  activeTab === "insights"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                } hover:text-blue-600`}
              >
                Cluster Insights 1
              </button>
              <button
                onClick={() => setActiveTab("learning")}
                className={`px-6 py-2 text-sm font-medium ${
                  activeTab === "learning"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                } hover:text-blue-600`}
              >
                Learning & Survey
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {activeTab === "insights" && (
                <div className="grid grid-cols-3 gap-5">
                  {/* Quiz Score */}
                  <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <h2 className="text-sm font-semibold">
                      Average Quiz Score
                    </h2>
                    <p className="text-xl font-bold text-gray-700">
                      {data.quizScore} / 10
                    </p>
                  </div>

                  {/* Total Users */}
                  <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <h2 className="text-sm font-semibold">Total Users</h2>
                    <p className="text-xl font-bold text-gray-700">
                      {data.totalUsers}
                    </p>
                  </div>

                  {/* Domain Interests */}
                  <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <h2 className="text-sm font-semibold">Domain Interests</h2>
                    <p className="text-xl font-bold text-gray-700">
                      {data.domainInterests.join(", ")}
                    </p>
                  </div>

                  {/* Interests */}
                  <div className="bg-gray-50 p-4 rounded-lg shadow-md col-span-2">
                    <h2 className="text-sm font-semibold">Common Interests:</h2>
                    <p className="text-xs text-gray-700">
                      {data.interests.join(", ")}
                    </p>
                  </div>

                  {/* Difficulty */}
                  <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <h2 className="text-sm font-semibold">Difficulty Level:</h2>
                    <p className="text-xs text-gray-700">{data.difficulty}</p>
                  </div>
                </div>
              )}

              {activeTab === "learning" && (
                <div className="grid grid-cols-2 gap-6">
                  {/* Learning Styles */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Learning Styles
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {data.learningStyles.map((item, idx) => (
                        <ProgressBar
                          key={idx}
                          label={item.label}
                          value={item.value}
                          color="blue"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Survey Parameters */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Survey Parameters
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {data.parameters.map((param, idx) => (
                        <ProgressBar
                          key={idx}
                          label={param.label}
                          value={param.value}
                          color="green"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
