import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  HelpCircle,
  Filter,
  ChevronDown,
  Link,
  Video,
  Book,
  Tag,
  BarChart,
  ListFilter,
  Info,
} from "lucide-react";
import { Toast } from "primereact/toast";
import useAuthContext from "../hooks/useAuthContext";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [activeRequestType, setActiveRequestType] = useState("all");
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const toast = useRef(null);

  const { dispatch, state } = useAuthContext();

  const getToken = () => {
    return localStorage.getItem("token");
  };
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

  // Fetch all requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/requests`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        const data = await response.json();
        setRequests(data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch requests");
        setLoading(false);
        console.error(err);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch requests",
          life: 3000,
        });
      }
    };

    fetchRequests();
  }, []);

  const handleLogout = () => {
    dispatch({ type: "LOADING" });
    dispatch({ type: "LOGOUT" });
  };

  // Handle approving a request
  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin/requests/${requestId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the local state
      setRequests(
        requests.map((req) =>
          req._id === requestId ? { ...req, status: "approved" } : req
        )
      );

      setSelectedRequest(null);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Request approved successfully",
        life: 3000,
      });
    } catch (err) {
      setError("Failed to approve request");
      console.error(err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to approve request",
        life: 3000,
      });
    }
  };

  // Handle rejecting a request
  const handleReject = async (requestId) => {
    if (!feedback.trim()) {
      setError("Feedback is required for rejecting a request");
      toast.current.show({
        severity: "warn",
        summary: "Warning",
        detail: "Feedback is required for rejecting a request",
        life: 3000,
      });
      return;
    }

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin/requests/${requestId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedback }),
        }
      );

      // Update the local state
      setRequests(
        requests.map((req) =>
          req._id === requestId ? { ...req, status: "rejected", feedback } : req
        )
      );

      setSelectedRequest(null);
      setFeedback("");
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Request rejected successfully",
        life: 3000,
      });
    } catch (err) {
      setError("Failed to reject request");
      console.error(err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to reject request",
        life: 3000,
      });
    }
  };

  // Filter requests
  const filteredRequests = requests?.filter((req) => {
    // Apply request type filter
    if (activeRequestType !== "all" && req.type !== activeRequestType)
      return false;

    // Apply status filter
    if (activeStatusTab !== "all" && req.status !== activeStatusTab)
      return false;

    return true;
  });



  // Get request type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "Resource":
        return <FileText className="w-5 h-5" />;
      case "Quiz":
        return <HelpCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  // Get resource type icon
  const getResourceTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "article":
        return <FileText className="w-5 h-5" />;
      case "documentation":
        return <Book className="w-5 h-5" />;
      case "link":
        return <Link className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Render Quiz payload
  const renderQuizPayload = (payload) => {
    return (
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-medium text-black flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5" />
            Question
          </h3>
          <p className="text-black font-medium">{payload.question}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-medium text-black flex items-center gap-2 mb-3">
            <ListFilter className="w-5 h-5" />
            Options
          </h3>
          <ul className="space-y-2">
            {payload.options.map((option, index) => {
              const letterOption = String.fromCharCode(65 + index);
              const isCorrect = payload.correctOption === letterOption;

              return (
                <li
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded ${
                    isCorrect ? "bg-gray-200" : "bg-white"
                  }`}
                >
                  {isCorrect && <CheckCircle className="w-4 h-4" />}
                  {!isCorrect && (
                    <span className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-300 text-xs">
                      {letterOption}
                    </span>
                  )}
                  <span>{option}</span>
                  {isCorrect && (
                    <span className="text-xs font-medium ml-auto">
                      Correct Answer
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-medium text-black flex items-center gap-2 mb-3">
            <Info className="w-5 h-5" />
            Explanation
          </h3>
          <p className="text-black">{payload.explanation}</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <div className="w-full md:w-auto">
            <h3 className="font-medium text-black flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {payload.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-200 text-black rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full md:w-auto ml-auto">
            <h3 className="font-medium text-black flex items-center gap-2 mb-2">
              <BarChart className="w-4 h-4" />
              Domain
            </h3>
            <span className="px-3 py-1 bg-gray-200 text-black rounded-full text-xs font-medium">
              {payload.domain}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render Resource payload
  const renderResourcePayload = (payload) => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-gray-100 p-4 rounded-lg flex-1">
            <h3 className="font-medium text-black flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5" />
              Resource Name
            </h3>
            <p className="text-black font-medium">{payload.name}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg flex-1">
            <h3 className="font-medium text-black flex items-center gap-2 mb-3">
              {getResourceTypeIcon(payload.type)}
              Resource Type
            </h3>
            <p className="capitalize text-black font-medium">{payload.type}</p>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-medium text-black flex items-center gap-2 mb-3">
            <Link className="w-5 h-5" />
            URL
          </h3>
          <a
            href={payload.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:underline break-all"
          >
            {payload.url}
          </a>
        </div>

        {payload.description && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium text-black flex items-center gap-2 mb-3">
              <Info className="w-5 h-5" />
              Description
            </h3>
            <p className="text-black">{payload.description}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <div>
            <h3 className="font-medium text-black flex items-center gap-2 mb-2">
              <BarChart className="w-4 h-4" />
              Difficulty
            </h3>
            <span className="px-3 py-1 bg-gray-200 text-black rounded-full text-xs font-medium">
              {payload.difficulty}
            </span>
          </div>

          {payload.tags && payload.tags.length > 0 && (
            <div>
              <h3 className="font-medium text-black flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {payload.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-200 text-black rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {payload.topics && payload.topics.length > 0 && (
            <div>
              <h3 className="font-medium text-black flex items-center gap-2 mb-2">
                <ListFilter className="w-4 h-4" />
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {payload.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-200 text-black rounded-full text-xs font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Stats calculations
  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((req) => req.status === "pending").length,
    approvedRequests: requests.filter((req) => req.status === "approved")
      .length,
    rejectedRequests: requests.filter((req) => req.status === "rejected")
      .length,
    quizRequests: requests.filter((req) => req.type === "Quiz").length,
    resourceRequests: requests.filter((req) => req.type === "Resource").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* PrimeReact Toast */}
      <Toast ref={toast} />

      {/* Header */}
      <header className="bg-black text-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-300">Manage community contributions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-300">
                {new Date().toISOString().slice(0, 10)}{" "}
                {new Date().toTimeString().slice(0, 8)}
              </div>
              <div className="text-white font-semibold">
                {state?.user?.name}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-100 font-medium cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error message */}
        {error && (
          <div className="bg-gray-200 border-l-4 border-black text-black p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Stats Summary (Always visible) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Request Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 bg-gray-100 rounded-lg">
                <Clock className="w-8 h-8 mb-2" />
                <span className="text-2xl font-bold">
                  {stats.pendingRequests}
                </span>
                <span className="text-xs text-gray-500">Pending</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-100 rounded-lg">
                <CheckCircle className="w-8 h-8 mb-2" />
                <span className="text-2xl font-bold">
                  {stats.approvedRequests}
                </span>
                <span className="text-xs text-gray-500">Approved</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-100 rounded-lg">
                <XCircle className="w-8 h-8 mb-2" />
                <span className="text-2xl font-bold">
                  {stats.rejectedRequests}
                </span>
                <span className="text-xs text-gray-500">Rejected</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Request Types</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 bg-gray-100 rounded-lg">
                <HelpCircle className="w-8 h-8 mb-2" />
                <span className="text-2xl font-bold">{stats.quizRequests}</span>
                <span className="text-xs text-gray-500">Quiz</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-100 rounded-lg">
                <FileText className="w-8 h-8 mb-2" />
                <span className="text-2xl font-bold">
                  {stats.resourceRequests}
                </span>
                <span className="text-xs text-gray-500">Resource</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Overall</h3>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <span className="text-4xl font-bold">
                  {stats.totalRequests}
                </span>
                <p className="text-gray-500 mt-2">Total Requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              className={`mr-4 py-2 px-4 font-medium text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                activeStatusTab === "all"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveStatusTab("all")}
            >
              All Status
            </button>
            <button
              className={`mr-4 py-2 px-4 font-medium text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                activeStatusTab === "pending"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveStatusTab("pending")}
            >
              <Clock className="w-4 h-4" /> Pending
            </button>
            <button
              className={`mr-4 py-2 px-4 font-medium text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                activeStatusTab === "approved"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveStatusTab("approved")}
            >
              <CheckCircle className="w-4 h-4" /> Approved
            </button>
            <button
              className={`mr-4 py-2 px-4 font-medium text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                activeStatusTab === "rejected"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveStatusTab("rejected")}
            >
              <XCircle className="w-4 h-4" /> Rejected
            </button>
          </div>
        </div>

        {/* Request type tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              className={`mr-4 py-2 px-4 font-medium text-sm cursor-pointer transition-colors ${
                activeRequestType === "all"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveRequestType("all")}
            >
              All Types
            </button>
            <button
              className={`mr-4 py-2 px-4 font-medium text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                activeRequestType === "Quiz"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveRequestType("Quiz")}
            >
              <HelpCircle className="w-4 h-4" /> Quiz Questions
            </button>
            <button
              className={`mr-4 py-2 px-4 font-medium text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                activeRequestType === "Resource"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveRequestType("Resource")}
            >
              <FileText className="w-4 h-4" /> Resources
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            {/* Requests table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests?.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No requests found
                        </td>
                      </tr>
                    ) : (
                      filteredRequests?.map((request) => (
                        <tr key={request._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getTypeIcon(request.type)}
                              <span className="ml-2">{request.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {request.requestedBy
                              ? request.requestedBy.name
                              : "Unknown User"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <StatusBadge status={request.status} />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 text-sm"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Selected request details modal */}
        {selectedRequest && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
      <div className="p-6 flex justify-between items-start border-b">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            {getTypeIcon(selectedRequest.type)}
            <span className="ml-2">{selectedRequest.type} Request</span>
          </h2>
          <p className="text-gray-500 mt-1">
            From:{" "}
            {selectedRequest.requestedBy
              ? selectedRequest.requestedBy.name
              : "Unknown User"}
          </p>
          <p className="text-gray-500 text-sm">
            Submitted on: {new Date(selectedRequest.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedRequest(null);
            setFeedback("");
            setError(null);
          }}
          className="text-gray-500 hover:text-black cursor-pointer"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[60vh]">
        {/* AI Confidence Score Section */}
        {selectedRequest.confidenceScore !== undefined && (
          <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <span>AI Confidence Score</span>
              <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">AI Generated</span>
            </h3>
            
            <div className="flex items-center mb-2">
              <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
                <div 
                  className={`h-4 rounded-full ${
                    selectedRequest.confidenceScore >= 70 ? 'bg-green-500' : 
                    selectedRequest.confidenceScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${selectedRequest.confidenceScore}%` }}
                ></div>
              </div>
              <span className={`font-bold ${
                selectedRequest.confidenceScore >= 70 ? 'text-green-600' : 
                selectedRequest.confidenceScore >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {selectedRequest.confidenceScore}%
              </span>
            </div>
            
            {selectedRequest.confidenceReason && (
              <div className="mt-2 text-sm text-gray-700">
                <p className="font-medium mb-1">Analysis:</p>
                <p>{selectedRequest.confidenceReason}</p>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-3">
              Last updated: {new Date(selectedRequest.updatedAt).toLocaleString()}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-medium text-lg mb-3">Request Details</h3>
          {selectedRequest.type === "Quiz" ? (
            renderQuizPayload(selectedRequest.payload)
          ) : selectedRequest.type === "Resource" ? (
            renderResourcePayload(selectedRequest.payload)
          ) : (
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(selectedRequest.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {selectedRequest.status === "pending" && (
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">
              Feedback (Required for Rejection)
            </h3>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              rows="4"
              placeholder="Provide feedback to the user..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
          </div>
        )}

        {selectedRequest.status !== "pending" && selectedRequest.feedback && (
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-2">Feedback</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>{selectedRequest.feedback}</p>
            </div>
          </div>
        )}

        {selectedRequest.status === "pending" && (
          <div className="flex justify-end gap-4">
            <button
              onClick={() => handleReject(selectedRequest._id)}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-black font-medium transition-colors"
              disabled={!feedback.trim()}
            >
              Reject
            </button>
            <button
              onClick={() => handleApprove(selectedRequest._id)}
              className={`px-4 py-2 text-white rounded-md font-medium transition-colors ${
                selectedRequest.confidenceScore >= 70 ? 'bg-green-600 hover:bg-green-700' : 'bg-black hover:bg-gray-800'
              }`}
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
};

export default AdminDashboard;
