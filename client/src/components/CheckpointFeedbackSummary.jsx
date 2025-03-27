import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ChevronDown, ChevronUp, Loader } from 'lucide-react';

const CheckpointFeedbackSummary = ({ checkpointId }) => {
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showAllFeedback, setShowAllFeedback] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (checkpointId) {
      fetchFeedbackData();
    }
  }, [checkpointId]);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/roadmap/feedback/checkpoint/${checkpointId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedbackData(data);
      }
    } catch (error) {
      console.error("Error fetching checkpoint feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-4 flex items-center justify-center">
        <Loader className="w-5 h-5 text-black animate-spin mr-2" />
        <span className="text-sm text-gray-500">Loading feedback...</span>
      </div>
    );
  }

  if (!feedbackData || !feedbackData.averageRating || feedbackData.averageRating.count === 0) {
    return (
      <div className="py-4 text-center text-gray-500 text-sm">
        <Star className="w-5 h-5 mx-auto mb-2" />
        No feedback available for this checkpoint yet
      </div>
    );
  }

  const { averageRating, feedback } = feedbackData;
  const displayFeedback = showAllFeedback 
    ? feedback 
    : feedback.slice(0, 3);

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
        <Star className="w-4 h-4 mr-2" /> 
        Community Feedback
      </h4>
      
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`w-5 h-5 ${
                star <= Math.round(averageRating.averageRating) 
                  ? "fill-black" 
                  : "text-gray-300"
              }`} 
            />
          ))}
        </div>
        <span className="ml-2 text-gray-700 font-medium">
          {averageRating.averageRating.toFixed(1)}
          <span className="text-gray-500 text-sm font-normal ml-1">
            ({averageRating.count} {averageRating.count === 1 ? 'review' : 'reviews'})
          </span>
        </span>
      </div>

      {displayFeedback.length > 0 && (
        <div className="space-y-3 mb-3">
          {displayFeedback.map((item) => (
            <div key={item._id} className="border-b border-gray-200 pb-3">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm text-gray-700">
                  {item.userId?.name || 'User'}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-3 h-3 ${
                        star <= item.rating 
                          ? "fill-black" 
                          : "text-gray-300"
                      }`} 
                    />
                  ))}
                </div>
              </div>
              {item.comment && (
                <p className="text-sm text-gray-600 mt-1">
                  {item.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {feedback.length > 3 && (
        <button
          onClick={() => setShowAllFeedback(!showAllFeedback)}
          className="w-full text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center py-1"
        >
          {showAllFeedback ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" /> 
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" /> 
              Show all ({feedback.length}) reviews
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CheckpointFeedbackSummary;