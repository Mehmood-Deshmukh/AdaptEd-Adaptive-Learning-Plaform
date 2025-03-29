import React from 'react';
import ProjectViewer from '../components/ProjectViewer';
import Sidebar from "../components/Sidebar";
import useAuthContext from '../hooks/useAuthContext';
import { Link } from "react-router-dom";

const ProjectsPage = () => {
  const { state } = useAuthContext();
  const { user } = state;
  return (
    <div className="h-[100vh] bg-white flex">
      <Sidebar user={user} />

      {user?.xps > 3000 ? (
        <div className="container mx-auto px-6 py-16 max-w-7xl overflow-scroll">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-bold mb-6 text-black">
            Coding Projects
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Explore interactive coding projects with step-by-step instructions. 
            Build your skills with hands-on practice and detailed guidance.
          </p>
        </header>
        
        <main className="mb-20">
          <ProjectViewer />
        </main>
      
      </div>
      ) : (
        <div className="h-screen w-screen flex justify-center items-center relative">
  {/* Background image */}
  <div 
    className="absolute inset-0 bg-cover object-contain bg-center bg-no-repeat"
    style={{ backgroundImage: "url('/projects.jpeg')" }}
  />

  {/* Blur overlay */}
  <div className="absolute inset-0 backdrop-blur-lg" />

  {/* Content */}
  <div className="relative z-10 bg-white bg-opacity-80 p-10 rounded-lg shadow-lg text-center">
    <p className="text-lg font-bold mb-3">You need more XP to access this section.</p>
    <p className="text-blue-800 underline">
      <Link to="/">Go back to Dashboard</Link>
    </p>
  </div>
</div>
      )}
      
    </div>
  );
};

export default ProjectsPage;