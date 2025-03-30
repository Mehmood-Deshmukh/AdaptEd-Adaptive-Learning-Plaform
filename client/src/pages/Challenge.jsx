import React, { useState, useEffect } from "react";
import {
  Code,
  Play,
  BookOpen,
  ChevronDown,
  Check,
  X,
  RefreshCw,
  ArrowLeft,
  Plus,
  FileCode,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import Sidebar from "../components/Sidebar";
import useAuthContext from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const CodingChallengePlatform = () => {
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const { user } = state;

  const [activeTab, setActiveTab] = useState("submit"); // 'create' or 'submit'
  const [challengeTopic, setChallengeTopic] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [result, setResult] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Get the appropriate language extension based on selection
  const getLanguageExtension = () => {
    switch (language) {
      case "javascript":
        return javascript();
      default:
        return javascript();
    }
  };

  // Fetch challenges from the API
  const fetchChallenges = async () => {
    setIsLoadingChallenges(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/challenge`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch challenges");
      }
      const data = await response.json();
      setChallenges(data.challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      showNotification(
        "error",
        "Failed to load challenges. Please try again."
      );
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  // Reset code when selecting a different challenge
  useEffect(() => {
    setCode("");
    setResult(null);
  }, [selectedChallenge]);

  // Initial fetch of challenges
  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleCreateChallenge = async (e) => {
    e.preventDefault();

    if (!challengeTopic.trim()) {
      showNotification("error", "Please enter a topic for the challenge");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/challenge/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic: challengeTopic }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showNotification("success", data.message);
        setChallengeTopic("");
        // Refresh challenges list
        fetchChallenges();
      } else {
        showNotification(
          "error",
          data.message || "Failed to create challenge"
        );
      }
    } catch (error) {
      showNotification("error", "Network error. Please try again later.");
      console.error("Error creating challenge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      showNotification("error", "Please enter your code");
      return;
    }

    if (!selectedChallenge) {
      showNotification("error", "Please select a challenge");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/challenge/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            challengeId: selectedChallenge._id,
            language,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        showNotification("success", "Code submitted successfully");
      } else {
        showNotification(
          "error",
          data.message || "Failed to submit code"
        );
      }
    } catch (error) {
      showNotification("error", "Network error. Please try again later.");
      console.error("Error submitting code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const handleBackButtonClick = () => {
    navigate("/challenge-selection");
  };

  return (
    <div className="min-h-screen h-screen flex bg-white text-black overflow-hidden">
      <Sidebar user={user} />
      
      <div className="flex-1 w-full max-w-full overflow-auto relative">
        {/* Back Button - Fixed position */}
        <button
          onClick={handleBackButtonClick}
          className="fixed z-50 top-4 left-4 h-10 w-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 shadow-lg transition-all duration-200 transform hover:scale-105"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        
        {/* Tab Selector */}
        <div className="flex justify-center pt-6 mb-6">
          <div className="bg-gray-100 rounded-full p-1 inline-flex shadow-md">
            <button
              onClick={() => setActiveTab("submit")}
              className={`rounded-full px-6 py-2 font-medium text-sm transition-all duration-200 ${
                activeTab === "submit"
                  ? "bg-black text-white shadow-sm"
                  : "bg-transparent text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCode size={16} />
                <span>Solve Challenge</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`rounded-full px-6 py-2 font-medium text-sm transition-all duration-200 ${
                activeTab === "create"
                  ? "bg-black text-white shadow-sm"
                  : "bg-transparent text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus size={16} />
                <span>Create Challenge</span>
              </div>
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className="fixed z-50 top-16 right-4 max-w-sm">
            <div
              className={`p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 animate-slide-in ${
                notification.type === "success"
                  ? "bg-white border-black"
                  : "bg-white border-gray-400"
              }`}
            >
              <div className="flex items-center">
                {notification.type === "success" ? (
                  <Check size={20} className="mr-3 text-black" />
                ) : (
                  <X size={20} className="mr-3 text-gray-600" />
                )}
                <p className="font-medium">{notification.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Container with padding */}
        <div className="container mx-auto px-6 pb-10">
          {/* Create Challenge Form */}
          {activeTab === "create" && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-black p-3 rounded-lg">
                  <Plus size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold">Create a New Challenge</h2>
              </div>
              
              <form onSubmit={handleCreateChallenge}>
                <div className="mb-6">
                  <label
                    htmlFor="topic"
                    className="block mb-2 font-medium text-gray-700"
                  >
                    Challenge Topic
                  </label>
                  <input
                    type="text"
                    id="topic"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    placeholder="Enter a challenging coding problem"
                    value={challengeTopic}
                    onChange={(e) => setChallengeTopic(e.target.value)}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Provide a clear and specific topic for your coding challenge
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Create Challenge</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Submit Solution Form */}
          {activeTab === "submit" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Challenge Selection */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-full">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <BookOpen size={20} className="text-black" />
                      <h2 className="text-xl font-bold">Challenges</h2>
                    </div>
                    <button
                      onClick={fetchChallenges}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      disabled={isLoadingChallenges}
                      title="Refresh challenges"
                    >
                      <RefreshCw
                        size={18}
                        className={isLoadingChallenges ? "animate-spin" : ""}
                      />
                    </button>
                  </div>

                  {isLoadingChallenges ? (
                    <div className="flex justify-center py-12">
                      <RefreshCw
                        size={24}
                        className="animate-spin text-gray-500"
                      />
                    </div>
                  ) : challenges.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="mb-4 bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen size={24} strokeWidth={1.5} className="text-gray-500" />
                      </div>
                      <p className="font-medium text-gray-700">No challenges available</p>
                      <p className="text-sm mt-2 text-gray-500">
                        Create a new challenge or refresh the list
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar">
                      {challenges?.map((challenge) => (
                        <div
                          key={challenge._id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                            selectedChallenge &&
                            selectedChallenge._id === challenge._id
                              ? "border-black bg-gray-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          }`}
                          onClick={() => setSelectedChallenge(challenge)}
                        >
                          <h3 className="font-semibold text-lg">{challenge.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {challenge.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Code Editor */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-full">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <Code size={20} className="text-black" />
                      <h2 className="text-xl font-bold">Solution</h2>
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2 text-sm border border-gray-300 rounded-lg p-2 bg-white shadow-sm">
                        <span className="font-medium">Language:</span>
                        <select
                          className="appearance-none bg-transparent focus:outline-none text-gray-800"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python" disabled>
                            Python (Coming Soon)
                          </option>
                          <option value="java" disabled>
                            Java (Coming Soon)
                          </option>
                        </select>
                        <ChevronDown size={16} className="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {selectedChallenge ? (
                    <>
                      <div className="bg-black text-white p-5 rounded-t-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen size={18} />
                          <h3 className="font-bold text-lg">{selectedChallenge.title}</h3>
                        </div>
                        <p className="text-gray-300">
                          {selectedChallenge.description}
                        </p>
                      </div>
                      <div className="border border-gray-300 rounded-b-lg overflow-hidden">
                        {/* CodeMirror Editor Component */}
                        <CodeMirror
                          value={code}
                          height="300px"
                          extensions={[getLanguageExtension()]}
                          onChange={(value) => setCode(value)}
                          theme={oneDark}
                          basicSetup={{
                            lineNumbers: true,
                            highlightActiveLineGutter: true,
                            highlightSpecialChars: true,
                            foldGutter: true,
                            dropCursor: true,
                            allowMultipleSelections: true,
                            indentOnInput: true,
                            syntaxHighlighting: true,
                            bracketMatching: true,
                            closeBrackets: true,
                            autocompletion: true,
                            rectangularSelection: true,
                            crosshairCursor: true,
                            highlightActiveLine: true,
                            highlightSelectionMatches: true,
                            closeBracketsKeymap: true,
                            searchKeymap: true,
                            foldKeymap: true,
                            completionKeymap: true,
                            lintKeymap: true,
                          }}
                        />
                      </div>
                      <div className="mt-5">
                        <button
                          onClick={handleSubmitCode}
                          disabled={isLoading}
                          className="bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 font-medium disabled:opacity-70"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw size={18} className="animate-spin" />
                              <span>Running...</span>
                            </>
                          ) : (
                            <>
                              <Play size={18} />
                              <span>Run Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Results Panel */}
                      {result && (
                        <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                          <div className="bg-gray-100 p-4 font-semibold border-b flex items-center gap-2">
                            {result.review === "Accepted" ? 
                              <Check size={18} className="text-black" /> : 
                              <X size={18} className="text-gray-700" />
                            }
                            <span>Results</span>
                          </div>
                          <div className="p-5 bg-white">
                            <div className="mb-5">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-black rounded-full"></span>
                                Output:
                              </h4>
                              <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm font-mono overflow-x-auto">
                                {result.result.stdout || "No output"}
                              </pre>
                            </div>

                            <div className="mb-5">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-black rounded-full"></span>
                                Expected Output:
                              </h4>
                              <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm font-mono overflow-x-auto">
                                {result.expectedOutput || "N/A"}
                              </pre>
                            </div>

                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-black rounded-full"></span>
                                Status:
                              </h4>
                              <div
                                className={`inline-flex items-center px-4 py-2 rounded-lg ${
                                  result.review === "Accepted"
                                    ? "bg-black text-white"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                {result.review === "Accepted" ? (
                                  <>
                                    <Check size={18} className="mr-2" />
                                    Accepted
                                  </>
                                ) : (
                                  <>
                                    <X size={18} className="mr-2" />
                                    Try Again
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <BookOpen size={36} strokeWidth={1.5} className="text-black" />
                      </div>
                      <p className="mt-2 font-medium text-gray-700">Select a challenge to start coding</p>
                      <p className="text-sm mt-1 text-gray-500">Choose from the list on the left</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingChallengePlatform;

/* Add this to your CSS for custom scrollbar */
/*
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@keyframes slide-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s forwards;
}
*/