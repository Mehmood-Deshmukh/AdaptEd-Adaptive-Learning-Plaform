import {
  BookOpen,
  Crown,
  Flame,
  Home,
  LogOut,
  Map,
  User,
  Users,
  Code,
  BookMarked
} from "lucide-react";
import React from "react";
import useAuthContext from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ user }) => {
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch({ type: "LOADING" });
    dispatch({ type: "LOGOUT" });
  };
  
  const userStats = {
    streak: 7,
    points: 2350,
    rank: "Explorer",
    completedQuizzes: 12,
    progress: 68,
  };
  
  const avatarUsername = encodeURIComponent(user.name);
  const avatarUrl = `https://avatar.iran.liara.run/username?username=${avatarUsername}`;
  
  return (
    <div className="w-64 bg-black text-white shadow-lg flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <h2 className="text-xl font-bold">AdaptEd</h2>
      </div>
      {/* User info */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center mb-4">
          <div className="rounded-full bg-gray-700 flex items-center justify-center">
            <img
              src={avatarUrl}
              alt={`${user.name}'s avatar`}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              loading="lazy"
            />
          </div>
          <div className="ml-3">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-gray-400">{userStats.rank}</p>
          </div>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <div className="flex items-center">
            <Flame size={16} className="mr-1" />
            <span>{user.currentStreak} days</span>
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
              className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Home size={18} className="mr-3" />
              <span>Dashboard</span>
            </a>
          </div>
          {/* Generate Quiz Button */}
          <div className="mb-1">
            <a
              onClick={() => navigate("/quiz-generator")}
              className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <BookMarked size={18} className="mr-3" />
              <span>Generate Quiz</span>
            </a>
          </div>
          {/* Generate Roadmap Button */}
          <div className="mb-1">
            <a
              onClick={() => navigate("/roadmap-generator")}
              className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Map size={18} className="mr-3" />
              <span>Generate Roadmap</span>
            </a>
          </div>
          {/* Forum Button */}
          <div className="mb-1">
            <a
              onClick={() => navigate("/forum")}
              className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Users size={18} className="mr-3" />
              <span>Forum</span>
            </a>
          </div>
          {/* Projects Button */}
          <div className="mb-1">
            <a
              onClick={() => navigate("/projects")}
              className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Code size={18} className="mr-3" />
              <span>Project Tutorials</span>
            </a>
          </div>
          <div className="mb-1">
            <a
              onClick={() => navigate("/profile")}
              className="flex items-center px-4 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <User size={18} className="mr-3" />
              <span>Profile</span>
            </a>
          </div>
        </div>
      </div>
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <LogOut size={18} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;