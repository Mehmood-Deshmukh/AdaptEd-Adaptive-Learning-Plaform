import {
  BookOpen,
  Map,
  Flame,
  Trophy,
  Crown,
  LogOut,
  User,
  ThumbsUp,
  ThumbsDown,
  Home as HomeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

const Forum = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAuthContext();
  const { user } = state;
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [votes, setVotes] = useState({});


  const handleCommentSubmit = (postId) => {
    if (!newComment.trim()) return;
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
    setNewComment("");
  };

  const handleVote = (postId, replyIndex, type) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: post.replies.map((reply, index) =>
                index === replyIndex
                  ? {
                      ...reply,
                      upvotes:
                        type === "upvote" ? reply.upvotes + 1 : reply.upvotes,
                      downvotes:
                        type === "downvote"
                          ? reply.downvotes + 1
                          : reply.downvotes,
                    }
                  : reply
              ),
            }
          : post
      )
    );
  };
  const userStats = {
    streak: 7,
    points: 2350,
    rank: "Explorer",
    completedQuizzes: 12,
    progress: 68,
  };

  const posts = [
    {
      id: 1,
      title: "How to style elements?",
      author: "JohnDoe",
      replies: [
        {
          user: "Alice",
          text: "You can start by installing Tailwind via npm.",
          upvotes: 0,
          downvotes: 0,
        },
        {
          user: "Bob",
          text: "Use utility classes to style elements easily.",
          upvotes: 0,
          downvotes: 0,
        },
      ],
    },
    {
      id: 2,
      title: "Best practices for React?",
      author: "JaneDoe",
      replies: [
        {
          user: "Alice",
          text: "You can start by creating project in vite",
          upvotes: 0,
          downvotes: 0,
        },
        { user: "Bob", text: "Use utility classes to style elements easily."
            ,upvotes: 0,
            downvotes: 0,
         },
      ],
    },
  ];

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 bg-black text-white h-full shadow-lg flex flex-col">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-xl font-bold">AdaptEd</h2>
          </div>

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

            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-white h-1.5 rounded-full"
                  style={{ width: `${userStats.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

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

              <div className="mb-1">
                <a
                  onClick={() => navigate("/quiz-generator")}
                  className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors"
                >
                  <BookOpen size={18} className="mr-3" />
                  <span>Generate Quiz</span>
                </a>
              </div>

              <div className="mb-1">
                <a
                  onClick={() => navigate("/roadmap-generator")}
                  className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors"
                >
                  <Map size={18} className="mr-3" />
                  <span>Generate Roadmap</span>
                </a>
              </div>

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

        <div className="forum">
          <div className="w-6xl mx-auto bg-white shadow-md rounded-lg p-4">
            <h1 className="text-2xl font-bold mb-4 text-black">
              AdaptEd Community Forum
              <button className="mt-4 bg-black text-lg text-white float-right py-1 px-3 rounded-lg mr-4">
                Create Post
              </button>
            </h1>

            {posts.map((post) => (
              <div
                key={post.id}
                className="border-b border-solid border-gray-700 py-3"
              >
                <h2 className="text-lg font-semibold text-black">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm">
                  Posted by {post.author} • {post.replies.length} replies
                </p>

                {/* Replies Section */}
                <div className="mt-2 space-y-2">
                  {post.replies.map((reply, index) => (
                    <div
                      key={index}
                      className="ml-4 border-l-2 border-gray-700 pl-3 p-2 m-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>

                        <p className="text-black">
                          <span className="font-semibold text-black">
                            {reply.user}:
                          </span>{" "}
                          {reply.text}
                        </p>
                      </div>

                      {/* Upvote & Downvote */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleVote(post.id, index, "upvote")}
                          className="text-black"
                        >
                          <ThumbsUp size={18} />
                        </button>
                        <span className="text-gray-600">{reply.upvotes}</span>
                        <button
                          onClick={() => handleVote(post.id, index, "downvote")}
                          className="text-black "
                        >
                          <ThumbsDown size={18} />
                        </button>
                        <span className="text-gray-600">{reply.downvotes}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="mt-2">
                  <input
                    type="text"
                    className="w-full bg-black text-white p-2 rounded-md py-6"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    className="mt-2 bg-black text-gray-200 py-1 px-3 rounded-md"
                    onClick={() => handleCommentSubmit(post.id)}
                  >
                    Comment
                  </button>
                </div>

                {/* Display Comments */}
                {comments[post.id] && (
                  <div className="mt-2">
                    {comments[post.id].map((comment, index) => (
                      <p key={index} className="text-gray-400 text-sm">
                        ➤ {comment}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Forum;
