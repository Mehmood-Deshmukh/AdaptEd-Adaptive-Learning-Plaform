import React, { useState, useEffect } from 'react';
import { Code, Play, BookOpen, ChevronDown, Check, X, RefreshCw } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const CodingChallengePlatform = () => {
  const [activeTab, setActiveTab] = useState('submit'); // 'create' or 'submit'
  const [challengeTopic, setChallengeTopic] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [result, setResult] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Get the appropriate language extension based on selection
  const getLanguageExtension = () => {
    switch(language) {
      case 'javascript':
        return javascript();
      default:
        return javascript();
    }
  };

  // Fetch challenges from the API
  const fetchChallenges = async () => {
    setIsLoadingChallenges(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/challenge`);
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      const data = await response.json();
      setChallenges(data.challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      showNotification('error', 'Failed to load challenges. Please try again.');
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  // Initial fetch of challenges
  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    
    if (!challengeTopic.trim()) {
      showNotification('error', 'Please enter a topic for the challenge');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/challenge/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: challengeTopic }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification('success', data.message);
        setChallengeTopic('');
        // Refresh challenges list
        fetchChallenges();
      } else {
        showNotification('error', data.message || 'Failed to create challenge');
      }
    } catch (error) {
      showNotification('error', 'Network error. Please try again later.');
      console.error('Error creating challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      showNotification('error', 'Please enter your code');
      return;
    }
    
    if (!selectedChallenge) {
      showNotification('error', 'Please select a challenge');
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/challenge/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          challengeId: selectedChallenge._id,
          language,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        showNotification('success', 'Code submitted successfully');
      } else {
        showNotification('error', data.message || 'Failed to submit code');
      }
    } catch (error) {
      showNotification('error', 'Network error. Please try again later.');
      console.error('Error submitting code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code size={24} />
            <h1 className="text-xl font-bold">CodeChallenge</h1>
          </div>
          <nav>
            <ul className="flex gap-4">
              <li 
                className={`cursor-pointer border-b-2 ${activeTab === 'create' ? 'border-white' : 'border-transparent'} pb-1`}
                onClick={() => setActiveTab('create')}
              >
                Create Challenge
              </li>
              <li 
                className={`cursor-pointer border-b-2 ${activeTab === 'submit' ? 'border-white' : 'border-transparent'} pb-1`}
                onClick={() => setActiveTab('submit')}
              >
                Solve Challenge
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 mt-8">
        {/* Notification */}
        {notification.show && (
          <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-gray-200 text-gray-900 border-l-4 border-gray-900' : 'bg-gray-200 text-gray-900 border-l-4 border-gray-500'}`}>
            <div className="flex items-center">
              {notification.type === 'success' ? <Check size={20} className="mr-2" /> : <X size={20} className="mr-2" />}
              <p>{notification.message}</p>
            </div>
          </div>
        )}

        {/* Create Challenge Form */}
        {activeTab === 'create' && (
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Create a New Challenge</h2>
            <form onSubmit={handleCreateChallenge}>
              <div className="mb-4">
                <label htmlFor="topic" className="block mb-2 font-medium">Challenge Topic</label>
                <input
                  type="text"
                  id="topic"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter challenge topic"
                  value={challengeTopic}
                  onChange={(e) => setChallengeTopic(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-gray-900 text-white py-2 px-6 rounded hover:bg-gray-700 transition-colors flex items-center"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Challenge'}
              </button>
            </form>
          </div>
        )}

        {/* Submit Solution Form */}
        {activeTab === 'submit' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Challenge Selection */}
            <div className="lg:col-span-1 bg-gray-100 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Select Challenge</h2>
                <button 
                  onClick={fetchChallenges}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  disabled={isLoadingChallenges}
                  title="Refresh challenges"
                >
                  <RefreshCw size={20} className={isLoadingChallenges ? "animate-spin" : ""} />
                </button>
              </div>
              
              {isLoadingChallenges ? (
                <div className="flex justify-center py-8">
                  <RefreshCw size={24} className="animate-spin text-gray-500" />
                </div>
              ) : challenges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No challenges available</p>
                  <p className="text-sm mt-2">Create a new challenge or refresh the list</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {challenges?.map((challenge) => (
                    <div
                      key={challenge._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedChallenge && selectedChallenge._id === challenge._id
                          ? 'border-gray-900 bg-gray-200'
                          : 'border-gray-300 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedChallenge(challenge)}
                    >
                      <h3 className="font-semibold text-lg">{challenge.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-2 bg-gray-100 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Solution</h2>
                <div className="relative">
                  <div className="flex items-center gap-2 text-sm border border-gray-300 rounded p-2 bg-white">
                    <span>Language:</span>
                    <select
                      className="appearance-none bg-transparent focus:outline-none"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python" disabled>Python (Coming Soon)</option>
                      <option value="java" disabled>Java (Coming Soon)</option>
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {selectedChallenge ? (
                <>
                  <div className="bg-gray-900 text-white p-4 rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} />
                      <h3 className="font-semibold">{selectedChallenge.title}</h3>
                    </div>
                    <p className="text-sm mt-2 text-gray-300">{selectedChallenge.description}</p>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg overflow-hidden">
                    {/* CodeMirror Editor Component */}
                    <CodeMirror
                      value={code}
                      height="250px"
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
                  <div className="mt-4">
                    <button
                      onClick={handleSubmitCode}
                      disabled={isLoading}
                      className="bg-gray-900 text-white py-2 px-6 rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Play size={16} />
                      {isLoading ? 'Running...' : 'Run Code'}
                    </button>
                  </div>

                  {/* Results Panel */}
                  {result && (
                    <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">
                      <div className="bg-gray-200 p-3 font-semibold">Results</div>
                      <div className="p-4">
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Output:</h4>
                          <pre className="bg-white p-3 rounded border border-gray-300 text-sm font-mono overflow-x-auto">
                            {result.result.stdout || 'No output'}
                          </pre>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Expected Output:</h4>
                          <pre className="bg-white p-3 rounded border border-gray-300 text-sm font-mono overflow-x-auto">
                            {result.expectedOutput || 'N/A'}
                          </pre>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Status:</h4>
                          <div className={`inline-flex items-center px-3 py-1 rounded ${result.review === 'Accepted' ? 'bg-gray-900 text-white' : 'bg-gray-300 text-gray-700'}`}>
                            {result.review === 'Accepted' ? (
                              <>
                                <Check size={16} className="mr-1" />
                                Accepted
                              </>
                            ) : (
                              <>
                                <X size={16} className="mr-1" />
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
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white border border-gray-300 rounded-lg">
                  <BookOpen size={48} strokeWidth={1} />
                  <p className="mt-4">Select a challenge to start coding</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CodingChallengePlatform;