import axios from "axios";
import { useEffect, useState } from "react";
import "../index.css";
import { Toast } from 'primereact/toast';
import QuizBlock from "./QuizBlock";

const Quiz = () => {
  const [quiz, setQuiz] = useState([]);
  const [questions, setQuestions] = useState([]);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const topic = formData.get("topic");
    const domain = formData.get("domain");
    const difficulty = formData.get("difficulty");
    const tags = formData.get("tags").trim().split(/\s+/);

    localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`

        },
        body: JSON.stringify({
          title: title,
          topic: topic,
          domain: domain,
          difficulty : difficulty,
          tags : tags
        })
      });
      const data = await res.json();
      setQuiz(data.quiz);
      console.log(quiz);
      console.log("questions :");
      console.log(quiz.questions);
    //   setQuestions(quiz.questions);

    if (data.quiz) {
        setQuestions(data.quiz.questions || []);
      }
      
    } catch (error) {
      console.log(error)
    }


  };



  return (
    <>

    { questions.length === 0 ? (<form className="space-y-12 bg-white text-black" onSubmit={handleOnSubmit} style={{marginLeft:'10%',marginTop:'5%',width:'80%',padding:'20px'}}>
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-black">
            Quiz Information
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="title"
                className="block text-sm/6 font-medium text-black"
              >
                Quiz Title
              </label>
              <div className="mt-2">
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="topic"
                className="block text-sm/6 font-medium text-black"
              >
                Quiz Topic
              </label>
              <div className="mt-2">
                <input
                  id="topic"
                  name="topic"
                  type="text"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="domain"
                className="block text-sm/6 font-medium text-black"
              >
                Quiz Domain
              </label>
              <div className="mt-2">
                <input
                  id="domain"
                  name="domain"
                  type="text"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="difficulty"
                className="block text-sm/6 font-medium text-black"
              >
                Quiz difficulty
              </label>
              <div className="mt-2">
                <input
                  id="difficulty"
                  name="difficulty"
                  type="text"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="tags"
                className="block text-sm/6 font-medium text-black"
              >
                Tags
              </label>
              <div className="mt-2">
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Generate Quiz
          </button>
        </div>
      </form>) : <QuizBlock questions={questions} quizId = {quiz._id}/>}
      
    </>
  );
};

export default Quiz;
