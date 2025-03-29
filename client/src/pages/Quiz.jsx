import { useEffect, useState } from "react";
import "../index.css";
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import QuizBlock from "./QuizBlock";
import useAuthContext from "../hooks/useAuthContext";
import Sidebar from "../components/Sidebar";


const Quiz = () => {
  const [quiz, setQuiz] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useAuthContext();
  const { user } = state;
  // Computer science related tags for selection
  const csTagsOptions = [
    { name: 'Algorithms', code: 'algorithms' },
    { name: 'Data Structures', code: 'data-structures' },
    { name: 'Web Development', code: 'web-dev' },
    { name: 'Database', code: 'database' },
    { name: 'Networking', code: 'networking' },
    { name: 'Cybersecurity', code: 'cybersecurity' },
    { name: 'Machine Learning', code: 'ml' },
    { name: 'Operating Systems', code: 'os' },
    { name: 'Programming Languages', code: 'languages' },
    { name: 'Software Engineering', code: 'software-eng' },
    { name: 'Cloud Computing', code: 'cloud' },
    { name: 'Mobile Development', code: 'mobile' },
    { name: 'Computer Organisation ', code: 'co'},
    { name: 'Theory of Computation ', code: 'toc'},
    { name: 'Git', code: 'git'}
  ];

  // Difficulty levels for dropdown
  const difficultyLevels = [
    { name: 'Easy', code: 'easy' },
    { name: 'Intermediate', code: 'intermediate' },
    { name: 'Advanced', code: 'advanced' },
  ];

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target);
    const topic = formData.get("topic");
    const difficulty = selectedDifficulty ? selectedDifficulty.code : '';
    const tags = selectedTags.map(tag => tag.code);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: `${topic}`,
          topic: topic,
          domain: "Computer Science",
          difficulty: difficulty,
          tags: tags
        })
      });
      const data = await res.json();
      setQuiz(data.quiz);

      if (data.quiz) {
        setQuestions(data.quiz.questions || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[100vh] bg-gray-50">
      <Sidebar user={user} />
      {isLoading ? (
        <div className="w-full max-w-xl mx-auto bg-white shadow-md rounded-lg overflow-hidden p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Generating Your Quiz</h2>
          <p className="text-gray-600">Please wait while we create your personalized quiz...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="w-full max-w-xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Generate Quiz</h2>
            <p className="text-sm text-gray-600 mt-1">Create a Computer Science quiz on your preferred topic</p>
          </div>

          <form className="px-8 py-6" onSubmit={handleOnSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Topic
                </label>
                <input
                  id="topic"
                  name="topic"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-gray-900"
                  placeholder="e.g. JavaScript Basics"
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <Dropdown
                  id="difficulty"
                  name="difficulty"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.value)}
                  options={difficultyLevels}
                  optionLabel="name"
                  placeholder="Select Difficulty"
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (Select Multiple)
                </label>
                <MultiSelect
                  id="tags"
                  display="chip"
                  value={selectedTags}
                  onChange={(e) => setSelectedTags(e.value)}
                  options={csTagsOptions}
                  optionLabel="name"
                  placeholder="Select Tags"
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  panelClassName="bg-white border border-gray-300"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Generate Quiz
              </button>
            </div>
          </form>
        </div>
      ) : (
        <QuizBlock questions={questions} quizId={quiz._id} />
      )}
    </div>
  );
};

export default Quiz;