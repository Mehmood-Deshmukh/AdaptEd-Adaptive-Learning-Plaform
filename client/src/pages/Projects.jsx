import React from 'react';
import ProjectViewer from '../components/ProjectViewer';
import Sidebar from "../components/Sidebar";
import useAuthContext from '../hooks/useAuthContext';

const ProjectsPage = () => {
  const { state } = useAuthContext();
  const { user } = state;
  return (
    <div className="h-[100vh] bg-white flex">
      <Sidebar user={user} />
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
    </div>
  );
};

export default ProjectsPage;