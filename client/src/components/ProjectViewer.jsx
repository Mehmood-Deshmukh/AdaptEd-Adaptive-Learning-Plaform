import React, { useState, useEffect } from 'react';
import { ExternalLink, Code, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'highlight.js/styles/github-dark.css';

const ProjectViewer = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [showProjectPopup, setShowProjectPopup] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projects/`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectData = async (title) => {
    try {
      setProjectLoading(true);
      setShowProjectPopup(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projects/get-project/${encodeURIComponent(title)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project data');
      }
      const data = await response.json();
      setProjectData(data);
      setSelectedProject(title);
    } catch (err) {
      console.error('Error fetching project data:', err);
    } finally {
      setProjectLoading(false);
    }
  };

  const closeProjectPopup = () => {
    setShowProjectPopup(false);
    setTimeout(() => {
      setSelectedProject(null);
      setProjectData(null);
    }, 300); // Small delay for closing animation
  };

  // Loading skeleton with animations
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <motion.div 
            key={i} 
            className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <div className="h-14 p-4">
              <div className="h-6 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
            </div>
            <div className="h-40 bg-gray-100 animate-pulse"></div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-100 rounded-full w-16 animate-pulse"></div>
                <div className="h-6 bg-gray-100 rounded-full w-16 animate-pulse"></div>
              </div>
              <div className="h-10 w-28 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div 
        className="rounded-2xl p-8 bg-red-50 border-2 border-red-100 shadow-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-semibold text-red-800 mb-3">Error Loading Projects</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={fetchProjects}
          className="px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all shadow-sm cursor-pointer"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  // Project Detail Popup with AnimatePresence
  const ProjectDetailPopup = () => {
    if (!showProjectPopup || !projectData) return null;
    
    return (
      <AnimatePresence>
        {showProjectPopup && (
          <motion.div 
            className="fixed inset-0  bg-black/60 backdrop-blur-md   flex items-center justify-center z-50 p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
                <h3 className="text-xl font-bold text-black">{projectData.title}</h3>
                <button 
                  onClick={closeProjectPopup}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6 text-black" />
                </button>
              </div>
              
              {projectLoading ? (
                <div className="flex justify-center items-center p-24">
                  <motion.div 
                    className="rounded-full h-16 w-16 border-t-4 border-b-4 border-black"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="p-6">
                    {/* Header section with image and meta */}
                    <div className="mb-8">
                      
                      <div className="flex flex-wrap gap-3 mb-4">
                        {projectData.tags && projectData.tags.map((tag, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {projectData.prerequisite && Object.keys(projectData.prerequisite).length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-xl mb-6">
                          <h4 className="font-bold text-gray-800 mb-2">Prerequisites</h4>
                          <ul className="space-y-1">
                            {Object.entries(projectData.prerequisite).map(([key, value], i) => (
                              <li key={i} className="text-gray-700">
                                <span className="font-medium">{key}</span> {value}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <a 
                          href={projectData.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Original
                        </a>
                      </div>
                    </div>
                    
                    {/* Project content sections */}
                    <div className="space-y-10">
                      {projectData.content && projectData.content.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="pb-8 border-b border-gray-100 last:border-0">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
                          
                          <div className="space-y-6">
                            {section.elements && section.elements.map((element, elementIdx) => (
                              <div key={elementIdx}>
                                {element.type === 'text' && (
                                  <p className="text-gray-800 leading-relaxed">{element.content}</p>
                                )}
                                
                                {element.type === 'code' && (
                                  <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto border border-gray-200">
                                    <pre className="font-mono text-sm text-gray-800">
                                      {element.content}
                                    </pre>
                                  </div>
                                )}
                                
                                {element.type === 'image' && (
                                  <div className="flex justify-center my-6">
                                    <img 
                                      src={element.url} 
                                      alt="Project illustration" 
                                      className="rounded-lg shadow-sm max-w-full"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Projects grid view with cards
  return (
    <div className="space-y-10">
      {/* Project grid */}
      {projects.length === 0 ? (
        <motion.div 
          className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Code className="h-16 w-16 mx-auto text-gray-400 mb-6" />
          <h3 className="text-2xl font-semibold mb-3 text-gray-800">No Projects Found</h3>
          <p className="text-gray-600 max-w-md mx-auto text-lg">
            Check back later for new projects.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project, index) => (
            <motion.div 
              key={index} 
              className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-black h-14 line-clamp-2">
                  {project.title}
                </h3>
              </div>
              
              {project.image && (
                <div className="w-full h-40">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <div className="p-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags && project.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags && project.tags.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-800">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
                
                <motion.button
                  onClick={() => fetchProjectData(project.title)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all w-full text-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Explore More
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Project Detail Popup */}
      <ProjectDetailPopup />
    </div>
  );
};

export default ProjectViewer;



