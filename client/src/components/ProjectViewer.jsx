import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Code, Tag, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { motion, AnimatePresence } from 'framer-motion';
import 'highlight.js/styles/github-dark.css';

const ProjectViewer = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedCheckpoints, setExpandedCheckpoints] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMarkdown, setProjectMarkdown] = useState(null);
  const [markdownLoading, setMarkdownLoading] = useState(false);
  const [showMarkdownPopup, setShowMarkdownPopup] = useState(false);

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

  const fetchProjectMarkdown = async (title) => {
    try {
      setMarkdownLoading(true);
      setShowMarkdownPopup(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projects/projects-markdown/${title}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch project markdown');
      }
      const data = await response.json();
      setProjectMarkdown(data.markdown);
      setSelectedProject(title);
    } catch (err) {
      console.error('Error fetching markdown:', err);
    } finally {
      setMarkdownLoading(false);
    }
  };

  const toggleProject = (index) => {
    setExpandedProject(expandedProject === index ? null : index);
  };

  const closeMarkdownPopup = () => {
    setShowMarkdownPopup(false);
    setTimeout(() => {
      setSelectedProject(null);
      setProjectMarkdown(null);
    }, 300); // Small delay for closing animation
  };

  // Helper function to adjust markdown text
  const adjustMdText = (text) => {
    if (!text) return text;
    text = text.replace(/<br \/>/g, "\n");
    const lines = text.split("\n");
    let insideCodeBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith("```")) {
        if (!insideCodeBlock && line.trim() === "```") {
          lines[i] = "```plaintext";
        }
        insideCodeBlock = !insideCodeBlock;
      }
    }
    return lines.join("\n");
  };

  // Loading skeleton with animations
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i} 
            className="border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <div className="p-6 bg-white">
              <div className="h-8 bg-gray-100 rounded-lg w-1/3 mb-4 animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse"></div>
              </div>
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

  // Markdown Popup with AnimatePresence
  const MarkdownPopup = () => {
    return (
      <AnimatePresence>
        {showMarkdownPopup && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 md:p-8"
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
                <h3 className="text-xl font-bold text-black">{selectedProject}</h3>
                <button 
                  onClick={closeMarkdownPopup}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6 text-black" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 md:p-8 max-h-[calc(90vh-80px)] bg-gray-50">
                {markdownLoading ? (
                  <div className="flex justify-center items-center py-24">
                    <motion.div 
                      className="rounded-full h-16 w-16 border-t-4 border-b-4 border-black"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none text-black bg-white" >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize, rehypeHighlight, rehypeRaw]}
                      components={{
                        code({ inline, className, children, ...props }) {
                          const isInline = inline || !className;
                          if (isInline) {
                            return (
                              <span className="bg-gray-200 font-mono text-black px-1 rounded">
                                {children}
                              </span>
                            );
                          } else {
                            return (
                              <pre className="bg-gray-900 text-gray-100 rounded mt-2 overflow-auto">
                                <code {...props} className={className}>
                                  {children}
                                </code>
                              </pre>
                            );
                          }
                        },
                        a({ children, href }) {
                          return (
                            <a href={href} className="text-blue-500 hover:underline">
                              {children}
                            </a>
                          );
                        },
                        table({ children }) {
                          return (
                            <table className="table-auto w-full border-collapse my-4">
                              {children}
                            </table>
                          );
                        },
                        tr({ children }) {
                          return <tr className="border-b">{children}</tr>;
                        },
                        th({ children }) {
                          return (
                            <th className="text-left py-2 px-4 border-b bg-gray-200">
                              {children}
                            </th>
                          );
                        },
                        td({ children }) {
                          return <td className="py-2 px-4 border-b">{children}</td>;
                        },
                        br() {
                          return <br />;
                        }
                      }}
                    >
                      {adjustMdText(projectMarkdown)}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Projects list view with animations
  return (
    <div className="space-y-10">
      {/* Project list */}
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
        <div className="grid gap-8 grid-cols-1">
          {projects.map((project, index) => (
            <motion.div 
              key={index} 
              className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div 
                className="p-8 cursor-pointer"
                onClick={() => toggleProject(index)}
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-black hover:text-gray-700 transition-colors">
                    {project.title}
                  </h2>
                  <motion.button 
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {expandedProject === index ? (
                      <ChevronUp className="h-6 w-6 text-black" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-black" />
                    )}
                  </motion.button>
                </div>
                
                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map((tag, tagIndex) => (
                      <motion.span 
                        key={tagIndex} 
                        className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 + (tagIndex * 0.05) }}
                      >
                        <Tag className="h-3.5 w-3.5 mr-1.5" />
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                )}
                
                {/* Prerequisites (if any) */}
                {project.prerequisite && Object.keys(project.prerequisite).length > 0 && (
                  <motion.div 
                    className="mt-6 p-4 bg-gray-50 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Prerequisites</h4>
                    <ul className="space-y-2">
                      {Object.entries(project.prerequisite).map(([key, value], i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start">
                          <span className="font-medium mr-1">{key}:</span> {value}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
              
              <AnimatePresence>
                {expandedProject === index && (
                  <motion.div 
                    className="px-8 pb-8 pt-2 border-t border-gray-100"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchProjectMarkdown(project.title);
                        }}
                        className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Code className="h-5 w-5" />
                        View Full Project
                      </motion.button>
                      
                      {project.link && (
                        <motion.a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 border-2 border-black rounded-xl text-black hover:bg-gray-50 transition-all flex items-center gap-2 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ExternalLink className="h-5 w-5" />
                          Original Source
                        </motion.a>
                      )}
                    </div>
                    
                    {/* Project image (if available) */}
                    {project.image && (
                      <motion.div 
                        className="mb-6 rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="w-full h-64 object-cover"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Markdown Popup */}
      <MarkdownPopup />
    </div>
  );
};

export default ProjectViewer;