import React, { useState, useEffect } from 'react';

import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  HelpCircle, 
  Filter, 
  Search,
  ChevronDown
} from 'lucide-react';
import useAuthContext from '../hooks/useAuthContext';


const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { dispatch } = useAuthContext();
  
  const getToken = () => {
    return localStorage.getItem('token');
    };
  // Fetch all requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        /* const response = await axios.get('/api/admin/requests'); */
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/requests`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });
        const data = await response.json();
        setRequests(data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch requests');
        setLoading(false);
        console.error(err);
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
      /* const response = await axios.put(`/api/admin/requests/${requestId}/approve`); */
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/requests/${requestId}/approve`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

      
      // Update the local state
      setRequests(requests.map(req => 
        req._id === requestId ? { ...req, status: 'approved' } : req
      ));
      
      setSelectedRequest(null);
    } catch (err) {
      setError('Failed to approve request');
      console.error(err);
    }
  };

  // Handle rejecting a request
  const handleReject = async (requestId) => {
    if (!feedback.trim()) {
      setError('Feedback is required for rejecting a request');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedback })
        });


      
      // Update the local state
      setRequests(requests.map(req => 
        req._id === requestId ? { ...req, status: 'rejected', feedback } : req
      ));
      
      setSelectedRequest(null);
      setFeedback('');
    } catch (err) {
      setError('Failed to reject request');
      console.error(err);
    }
  };

  // Filter requests
  const filteredRequests = requests?.filter(req => {
    // Apply status filter
    if (filter !== 'all' && req.status !== filter) return false;
    
    // Apply search term (to user name, or payload content)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const hasUserMatch = req.requestedBy && 
        req.requestedBy.name && 
        req.requestedBy.name.toLowerCase().includes(searchLower);
      
      const hasContentMatch = JSON.stringify(req.payload)
        .toLowerCase()
        .includes(searchLower);
      
      if (!hasUserMatch && !hasContentMatch) return false;
    }
    
    return true;
  });

  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get request type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Resource':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'Quiz':
        return <HelpCircle className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-black text-white shadow-md flex items-center justify-between">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-300">Manage community contributions</p>
        </div>

        <div className="container mx-auto px-4 py-2 flex justify-end">
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-100 font-medium"
            >
                Logout
            </button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <select 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
            </div>
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            {/* Requests table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests?.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
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
                            {request.requestedBy ? request.requestedBy.name : 'Unknown User'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(request.status)}
                              <span className="ml-2 capitalize">{request.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="text-black hover:text-gray-700 font-medium"
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
                    From: {selectedRequest.requestedBy ? selectedRequest.requestedBy.name : 'Unknown User'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedRequest(null);
                    setFeedback('');
                    setError(null);
                  }}
                  className="text-gray-500 hover:text-black"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-2">Request Details</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(selectedRequest.payload, null, 2)}
                    </pre>
                  </div>
                </div>
                
                {selectedRequest.status === 'pending' && (
                  <div className="mb-6">
                    <h3 className="font-medium text-lg mb-2">Feedback (Required for Rejection)</h3>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      rows="4"
                      placeholder="Provide feedback to the user..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    ></textarea>
                  </div>
                )}
                
                {selectedRequest.status === 'rejected' && (
                  <div className="mb-6">
                    <h3 className="font-medium text-lg mb-2">Rejection Feedback</h3>
                    <div className="bg-red-50 p-4 rounded-md text-red-800">
                      {selectedRequest.feedback}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-gray-50 flex justify-end gap-3">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleReject(selectedRequest._id)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-red-600 hover:bg-gray-50 font-medium flex items-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest._id)}
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                  </>
                )}
                {selectedRequest.status !== 'pending' && (
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium"
                  >
                    Close
                  </button>
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