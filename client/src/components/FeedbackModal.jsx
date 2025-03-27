import React, { useState, useEffect } from 'react';
import { Star, X, MessageSquare, ThumbsUp, Loader } from 'lucide-react';

const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  checkpointId, 
  roadmapId, 
  checkpointTitle, 
  onFeedbackSubmitted 
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [success, setSuccess] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (isOpen && checkpointId) {
      fetchExistingFeedback();
    }
    setSuccess(false);
  }, [isOpen, checkpointId]);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchExistingFeedback = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/roadmap/feedback/user/checkpoint/${checkpointId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data._id) {
          setExistingFeedback(data);
          setRating(data.rating);
          setComment(data.comment || '');
        }
      }
    } catch (error) {
      console.error("Error fetching existing feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/api/roadmap/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          roadmapId,
          checkpointId,
          rating,
          comment
        })
      });

      if (response.ok) {
        setSuccess(true);
        
        if (typeof onFeedbackSubmitted === 'function') {
          onFeedbackSubmitted(roadmapId, checkpointId);
        }
        
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {existingFeedback ? 'Update Your Feedback' : 'Leave Feedback'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center p-6">
            <Loader className="w-8 h-8 text-black animate-spin mb-4" />
            <p className="text-gray-600">Loading your feedback...</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Thank you for your feedback!</h3>
            <p className="text-gray-600 text-center">Your feedback helps improve our learning materials.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              How would you rate <span className="font-medium">{checkpointTitle}</span>?
            </p>

            <div className="flex justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="mx-1 focus:outline-none transition-transform transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" /> Additional Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows="4"
                placeholder="Share your experience with this checkpoint..."
                maxLength={500}
              ></textarea>
              <div className="text-right text-xs text-gray-500 mt-1">
                {comment.length}/500 characters
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  rating === 0 || isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-slate-800"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>Submit Feedback</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;