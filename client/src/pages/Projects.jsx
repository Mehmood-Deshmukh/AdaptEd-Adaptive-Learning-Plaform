import React from 'react';
import ProjectViewer from '../components/ProjectViewer';

const ProjectsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
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
        
        <footer className="text-center py-12 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-4">
              © 2025 Inspiron25 Learning Platform. All projects are designed for educational purposes.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-500 hover:text-black transition-colors cursor-pointer">About</a>
              <a href="#" className="text-gray-500 hover:text-black transition-colors cursor-pointer">Contact</a>
              <a href="#" className="text-gray-500 hover:text-black transition-colors cursor-pointer">Terms</a>
              <a href="#" className="text-gray-500 hover:text-black transition-colors cursor-pointer">Privacy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ProjectsPage;