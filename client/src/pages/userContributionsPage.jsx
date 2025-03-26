import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, 
  Book, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  FileText,
  LinkIcon,
  Tag,
  User,
  Check,
  File,
  X
} from 'lucide-react';

import { Dialog } from 'primereact/dialog';
import Sidebar from "../components/Sidebar";
import useAuthContext from '../hooks/useAuthContext';
import { Toast } from 'primereact/toast';

const UserContributionsPage = () => {
  const [activeTab, setActiveTab] = useState('myContributions');
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formType, setFormType] = useState('Resource');
  const { state } = useAuthContext();
  const { user } = state;
  
  const toast = useRef(null);
  // Resource form state
  const [resourceForm, setResourceForm] = useState({
    name: '',
    url: '',
    type: 'article',
    tags: [],
    difficulty: 'beginner',
    topics: [],
    description: ''
  });
  
  // Question form state
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctOption: '',
    explanation: '',
    tags: [],
    domain: ''
  });

  // Modal state for feedback
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    title: '',
    message: ''
  });

  const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // Current tag input values
  const [resourceTagInput, setResourceTagInput] = useState('');
  const [resourceTopicInput, setResourceTopicInput] = useState('');
  const [questionTagInput, setQuestionTagInput] = useState('');
  
  useEffect(() => {
    if (activeTab === 'myContributions') {
      fetchContributions();
    }
  }, [activeTab]);

  const fetchContributions = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/request/my-contributions`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load your contributions');
      }

      const data = await response.json();

      setContributions(data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load your contributions');
      setLoading(false);
      console.error(err);
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/request/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          type: 'Resource',
          payload: resourceForm
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit resource');
      }
      
      // Reset form
      setResourceForm({
        name: '',
        url: '',
        type: 'article',
        tags: [],
        difficulty: 'beginner',
        topics: [],
        description: ''
      });
      

      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Resource submitted successfully!' });
      
      // Switch to contributions tab
      setActiveTab('myContributions');
      fetchContributions();
    } catch (err) {
      setError('Failed to submit resource');
      toast.current.show({ severity: 'error', summary: 'Error', detail: err.message || 'Failed to submit resource' });
      console.error(err);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out any empty options
      const filteredOptions = questionForm.options.filter(option => option.trim() !== '');
      
      if (filteredOptions.length < 2) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please provide at least 2 options' });
        return;
      }
      
      // Check if a correct option is selected
      if (!questionForm.correctOption) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please select a correct option' });
        return;
      }
      
      // Convert letter (A, B, C, D) to index (0, 1, 2, 3)
      const correctIndex = questionForm.correctOption.charCodeAt(0) - 65;
      
      // Ensure the correct option index is valid for the filtered options
      if (correctIndex < 0 || correctIndex >= filteredOptions.length) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Invalid correct option selected' });
        return;
      }
      
      // Create the payload with the correct option stored as the actual option value
      const payload = {
        ...questionForm,
        options: filteredOptions
      };
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/request/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          type: 'Quiz',
          payload
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit question');
      }
      
      // Reset form
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctOption: '',
        explanation: '',
        tags: [],
        domain: ''
      });
      
      // Show success modal
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Question submitted successfully!' });
      
      // Switch to contributions tab
      setActiveTab('myContributions');
      fetchContributions();
    } catch (err) {
      setError('Failed to submit question');
      toast.current.show({ severity: 'error', summary: 'Error', detail: err.message || 'Failed to submit question' });
      console.error(err);
    }
  };
  
  // Display feedback using Modal
  const showFeedbackModal = (contribution) => {
    const title = contribution.type === 'Resource' 
      ? contribution.payload.name 
      : contribution.payload.question;
    
    const feedback = contribution.feedback || "No specific feedback was provided.";
    
    setFeedbackModal({
      visible: true,
      title: title,
      message: feedback
    });
  };

  // Helper for tag handling
  const addTag = (tag, formType) => {
    if (tag.trim() === '') return;
    
    if (formType === 'resource-tag') {
      if (!resourceForm.tags.includes(tag)) {
        setResourceForm({
          ...resourceForm,
          tags: [...resourceForm.tags, tag]
        });
      }
      setResourceTagInput('');
    } else if (formType === 'resource-topic') {
      if (!resourceForm.topics.includes(tag)) {
        setResourceForm({
          ...resourceForm,
          topics: [...resourceForm.topics, tag]
        });
      }
      setResourceTopicInput('');
    } else if (formType === 'question-tag') {
      if (!questionForm.tags.includes(tag)) {
        setQuestionForm({
          ...questionForm,
          tags: [...questionForm.tags, tag]
        });
      }
      setQuestionTagInput('');
    }
  };
  
  const removeTag = (tag, formType) => {
    if (formType === 'resource-tag') {
      setResourceForm({
        ...resourceForm,
        tags: resourceForm.tags.filter(t => t !== tag)
      });
    } else if (formType === 'resource-topic') {
      setResourceForm({
        ...resourceForm,
        topics: resourceForm.topics.filter(t => t !== tag)
      });
    } else if (formType === 'question-tag') {
      setQuestionForm({
        ...questionForm,
        tags: questionForm.tags.filter(t => t !== tag)
      });
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'approved':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'rejected':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'pending':
          return <Clock className="w-4 h-4" />;
        case 'approved':
          return <CheckCircle className="w-4 h-4" />;
        case 'rejected':
          return <XCircle className="w-4 h-4" />;
        default:
          return null;
      }
    };

    return (
      <span className={`px-3 py-1 inline-flex items-center gap-1 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
        {getStatusIcon()}
        <span className="capitalize">{status}</span>
      </span>
    );
  };
  
  // Feedback Modal Footer
  const feedbackModalFooter = (
    <div className="flex justify-end">
      <button 
        onClick={() => setFeedbackModal({...feedbackModal, visible: false})}
        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="flex h-[100vh] bg-white text-black">
      <Toast ref={toast} />
      <Sidebar user={user} />
      
      {/* Feedback Modal */}
      <Dialog 
        header={feedbackModal.title} 
        visible={feedbackModal.visible} 
        style={{ width: '50vw' }} 
        footer={feedbackModalFooter}
        onHide={() => setFeedbackModal({...feedbackModal, visible: false})}
      >
        <p className="m-0">{feedbackModal.message}</p>
      </Dialog>
      
      <div className='flex flex-col h-full w-6xl mx-auto overflow-y-auto'>
      <header className="text-black">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Contribute</h1>
          <p className="text-gray-800">Share resources and questions with the community</p>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 w-[70vw]">
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'myContributions'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('myContributions')}
            >
              My Contributions
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'contribute'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('contribute')}
            >
              New Contribution
            </button>
          </nav>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* My Contributions Tab */}
        {activeTab === 'myContributions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Your Contributions</h2>
              <button
                onClick={() => setActiveTab('contribute')}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                New Contribution
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : contributions.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <File className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contributions yet</h3>
                <p className="text-gray-500 mb-6">Start contributing resources or questions to the community</p>
                <button
                  onClick={() => setActiveTab('contribute')}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  Create Your First Contribution
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contributions.map((contribution) => (
                  <div
                    key={contribution._id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          {contribution.type === 'Resource' ? (
                            <Book className="w-5 h-5 text-black" />
                          ) : (
                            <HelpCircle className="w-5 h-5 text-black" />
                          )}
                          <span className="ml-2 font-medium">{contribution.type}</span>
                        </div>
                        <StatusBadge status={contribution.status} />
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {contribution.type === 'Resource' 
                          ? contribution.payload.name 
                          : contribution.payload.question}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {contribution.type === 'Resource' 
                          ? contribution.payload.description 
                          : contribution.payload.explanation}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {contribution.type === 'Resource' &&
                          contribution.payload.tags &&
                          contribution.payload.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          
                        {contribution.type === 'Quiz' &&
                          contribution.payload.tags &&
                          contribution.payload.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                      
                      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Submitted on {new Date(contribution.createdAt).toLocaleDateString()}
                        </span>
                        
                        {contribution.status === 'rejected' && (
                          <button
                            onClick={() => showFeedbackModal(contribution)}
                            className="text-xs text-white rounded-xl flex items-center gap-1 cursor-pointer p-3 bg-black hover:bg-slate-700"
                          >
                            <Info className="w-4 h-4" />
                            View Feedback
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contribute Tab */}
        {activeTab === 'contribute' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Create New Contribution</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-6">
                  <button
                    className={`flex-1 py-3 flex justify-center items-center gap-2 rounded-md ${
                      formType === 'Resource'
                        ? 'bg-black text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormType('Resource')}
                  >
                    <FileText className="w-5 h-5" />
                    Resource
                  </button>
                  <button
                    className={`flex-1 py-3 flex justify-center items-center gap-2 rounded-md ${
                      formType === 'Quiz'
                        ? 'bg-black text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormType('Quiz')}
                  >
                    <HelpCircle className="w-5 h-5" />
                    Question
                  </button>
                  <button
                    className={`flex-1 py-3 flex justify-center items-center gap-2 rounded-md ${
                      formType === 'Project'
                        ? 'bg-black text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormType('Project')}
                  >
                    <FileText className="w-5 h-5" />
                   Project
                  </button>
                  
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  <Info className="w-4 h-4 inline mr-1" />
                  All contributions are reviewed by admins before being published
                </p>
              </div>
              
              {/* Resource Form */}
              {formType === 'Resource' && (
                <form onSubmit={handleResourceSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="resource-name">
                      Resource Name
                    </label>
                    <input
                      id="resource-name"
                      type="text"
                      value={resourceForm.name}
                      onChange={(e) => setResourceForm({...resourceForm, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Name of the resource"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="resource-url">
                      URL
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-black focus-within:border-transparent">
                      <LinkIcon className="w-5 h-5 text-gray-400 ml-3" />
                      <input
                        id="resource-url"
                        type="url"
                        value={resourceForm.url}
                        onChange={(e) => setResourceForm({...resourceForm, url: e.target.value})}
                        className="w-full px-3 py-2 border-0 focus:outline-none"
                        placeholder="https://example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Resource Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['article', 'video', 'course', 'documentation', 'book', 'tool'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setResourceForm({...resourceForm, type})}
                          className={`py-2 px-3 text-sm border rounded-md ${
                            resourceForm.type === type
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Difficulty Level
                    </label>
                    <div className="flex gap-3">
                      {['beginner', 'intermediate', 'advanced'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setResourceForm({...resourceForm, difficulty: level})}
                          className={`flex-1 py-2 px-3 text-sm border rounded-md ${
                            resourceForm.difficulty === level
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="capitalize">{level}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md mb-2">
                      {resourceForm.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag, 'resource-tag')}
                            className="ml-1 text-gray-500 hover:text-black"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={resourceTagInput}
                        onChange={(e) => setResourceTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addTag(resourceTagInput, 'resource-tag');
                          }
                        }}
                        className="flex-1 min-w-[120px] px-2 py-1 border-0 focus:outline-none"
                        placeholder={resourceForm.tags.length === 0 ? "Add tags (press Enter)" : ""}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Press Enter or comma after each tag</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Topics
                    </label>
                    <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md mb-2">
                      {resourceForm.topics.map((topic, index) => (
                        <span 
                          key={index}
                          className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {topic}
                          <button
                            type="button"
                            onClick={() => removeTag(topic, 'resource-topic')}
                            className="ml-1 text-gray-500 hover:text-black"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={resourceTopicInput}
                        onChange={(e) => setResourceTopicInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addTag(resourceTopicInput, 'resource-topic');
                          }
                        }}
                        className="flex-1 min-w-[120px] px-2 py-1 border-0 focus:outline-none"
                        placeholder={resourceForm.topics.length === 0 ? "Add topics (press Enter)" : ""}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Press Enter or comma after each topic</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="resource-description">
                      Description
                    </label>
                    <textarea
                      id="resource-description"
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      rows="4"
                      placeholder="Provide a brief description of the resource"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Submit Resource
                    </button>
                  </div>
                </form>
              )}
              
              {/* Question Form */}
              {formType === 'Quiz' && (
                <form onSubmit={handleQuestionSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="question-text">
                      Question
                    </label>
                    <textarea
                      id="question-text"
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      rows="3"
                      placeholder="Enter your question here"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
  <label className="block text-gray-700 text-sm font-medium mb-2">
    Options (minimum 2)
  </label>
  {questionForm.options.map((option, index) => (
    <div key={index} className="flex items-center mb-2">
      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-2">
        {String.fromCharCode(65 + index)}
      </div>
      <input
        type="text"
        value={option}
        onChange={(e) => {
          const newOptions = [...questionForm.options];
          newOptions[index] = e.target.value;
          setQuestionForm({...questionForm, options: newOptions});
        }}
        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        placeholder={`Option ${index + 1}`}
      />
      <button
        type="button"
        onClick={() => {
          if (questionForm.correctOption === String.fromCharCode(65 + index)) {
            setQuestionForm({...questionForm, correctOption: ''});
          }
          const newOptions = [...questionForm.options];
          newOptions[index] = '';
          setQuestionForm({...questionForm, options: newOptions});
        }}
        className="ml-2 text-gray-400 hover:text-black"
        title="Clear option"
      >
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  ))}
</div>
<div className="mb-4">
  <label className="block text-gray-700 text-sm font-medium mb-2">
    Correct Option
  </label>
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
    {questionForm.options.map((option, index) => {
      const letterOption = String.fromCharCode(65 + index);
      return (
        <button
          key={index}
          type="button"
          disabled={!option.trim()}
          onClick={() => setQuestionForm({...questionForm, correctOption: letterOption})}
          className={`py-2 px-3 text-sm border rounded-md ${
            option.trim() === ''
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : questionForm.correctOption === letterOption
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>{letterOption}</span>
            {questionForm.correctOption === letterOption && <Check className="w-4 h-4" />}
          </div>
        </button>
      );
    })}
  </div>
</div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="explanation">
                      Explanation
                    </label>
                    <textarea
                      id="explanation"
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      rows="3"
                      placeholder="Explain why the correct answer is right"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="domain">
                      Domain
                    </label>
                    <select
                      id="domain"
                      value={questionForm.domain}
                      onChange={(e) => setQuestionForm({...questionForm, domain: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    >
                      <option value="">Select a domain</option>
                      <option value="frontend">Frontend Development</option>
                      <option value="backend">Backend Development</option>
                      <option value="database">Databases</option>
                      <option value="devops">DevOps</option>
                      <option value="mobile">Mobile Development</option>
                      <option value="cloud">Cloud Computing</option>
                      <option value="security">Security</option>
                      <option value="algorithms">Algorithms & Data Structures</option>
                      <option value="networking">Networking</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md mb-2">
                      {questionForm.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag, 'question-tag')}
                            className="ml-1 text-gray-500 hover:text-black"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={questionTagInput}
                        onChange={(e) => setQuestionTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addTag(questionTagInput, 'question-tag');
                          }
                        }}
                        className="flex-1 min-w-[120px] px-2 py-1 border-0 focus:outline-none"
                        placeholder={questionForm.tags.length === 0 ? "Add tags (press Enter)" : ""}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Press Enter or comma after each tag</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Submit Question
                    </button>
                  </div>
                </form>
              )}

              {/* Project Form */}
              {formType === 'Project' && (
                <form onSubmit={handleQuestionProject} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="question-text">
                      Project
                    </label>
                    <textarea
                      id="question-text"
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      rows="3"
                      placeholder="Enter your question here"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
  <label className="block text-gray-700 text-sm font-medium mb-2">
    Options (minimum 2)
  </label>
  {questionForm.options.map((option, index) => (
    <div key={index} className="flex items-center mb-2">
      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-2">
        {String.fromCharCode(65 + index)}
      </div>
      <input
        type="text"
        value={option}
        onChange={(e) => {
          const newOptions = [...questionForm.options];
          newOptions[index] = e.target.value;
          setQuestionForm({...questionForm, options: newOptions});
        }}
        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        placeholder={`Option ${index + 1}`}
      />
      <button
        type="button"
        onClick={() => {
          if (questionForm.correctOption === String.fromCharCode(65 + index)) {
            setQuestionForm({...questionForm, correctOption: ''});
          }
          const newOptions = [...questionForm.options];
          newOptions[index] = '';
          setQuestionForm({...questionForm, options: newOptions});
        }}
        className="ml-2 text-gray-400 hover:text-black"
        title="Clear option"
      >
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  ))}
</div>
<div className="mb-4">
  <label className="block text-gray-700 text-sm font-medium mb-2">
    Correct Option
  </label>
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
    {questionForm.options.map((option, index) => {
      const letterOption = String.fromCharCode(65 + index);
      return (
        <button
          key={index}
          type="button"
          disabled={!option.trim()}
          onClick={() => setQuestionForm({...questionForm, correctOption: letterOption})}
          className={`py-2 px-3 text-sm border rounded-md ${
            option.trim() === ''
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : questionForm.correctOption === letterOption
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>{letterOption}</span>
            {questionForm.correctOption === letterOption && <Check className="w-4 h-4" />}
          </div>
        </button>
      );
    })}
  </div>
</div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="explanation">
                      Explanation
                    </label>
                    <textarea
                      id="explanation"
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      rows="3"
                      placeholder="Explain why the correct answer is right"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="domain">
                      Domain
                    </label>
                    <select
                      id="domain"
                      value={questionForm.domain}
                      onChange={(e) => setQuestionForm({...questionForm, domain: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    >
                      <option value="">Select a domain</option>
                      <option value="frontend">Frontend Development</option>
                      <option value="backend">Backend Development</option>
                      <option value="database">Databases</option>
                      <option value="devops">DevOps</option>
                      <option value="mobile">Mobile Development</option>
                      <option value="cloud">Cloud Computing</option>
                      <option value="security">Security</option>
                      <option value="algorithms">Algorithms & Data Structures</option>
                      <option value="networking">Networking</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md mb-2">
                      {questionForm.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag, 'question-tag')}
                            className="ml-1 text-gray-500 hover:text-black"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={questionTagInput}
                        onChange={(e) => setQuestionTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addTag(questionTagInput, 'question-tag');
                          }
                        }}
                        className="flex-1 min-w-[120px] px-2 py-1 border-0 focus:outline-none"
                        placeholder={questionForm.tags.length === 0 ? "Add tags (press Enter)" : ""}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Press Enter or comma after each tag</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Submit Question
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
      
    </div>
  );
};

export default UserContributionsPage;