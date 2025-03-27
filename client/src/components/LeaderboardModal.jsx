import React from "react";
import { Award, Clock, CheckCircle, X, Users, Star } from "lucide-react";

const LeaderboardModal = ({ isOpen, onClose, leaderboardData, currentUserId }) => {
  if (!isOpen) return null;

  const formatTime = (milliseconds) => {
    if (!milliseconds) return "0 min";
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getAvatar = (username) => {
    const avatarUsername = encodeURIComponent(username);
    return `https://api.dicebear.com/9.x/initials/svg?seed=${avatarUsername}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Award className="w-6 h-6 mr-2" /> Roadmap Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-700 flex items-center mb-2">
            <Users className="w-4 h-4 mr-2" /> Learning Together
          </h3>
          <p className="text-blue-600 text-sm">
            You're learning with {leaderboardData.length - 1} other students. Keep up your progress to climb the leaderboard!
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> Progress
                  </div>
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> Time Spent
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((user, index) => (
                <tr 
                  key={user.userId} 
                  className={`border-b hover:bg-gray-50 ${user.userId === currentUserId ? 'bg-gray-100' : ''}`}
                >
                  <td className="py-4 px-4 whitespace-nowrap">
                    {index === 0 ? (
                      <div className="flex items-center justify-center bg-yellow-400 rounded-full w-8 h-8">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                    ) : index === 1 ? (
                      <div className="flex items-center justify-center bg-gray-300 rounded-full w-8 h-8">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                    ) : index === 2 ? (
                      <div className="flex items-center justify-center bg-amber-600 rounded-full w-8 h-8">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <span className="text-gray-700 font-medium ml-2">{index + 1}</span>
                    )}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                        <img 
                          src={getAvatar(user.name)} 
                          alt={user.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name} {user.userId === currentUserId && "(You)"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4  mr-1" />
                      <span className="text-sm text-gray-700">{user.level}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-700">{user.completedCheckpoints}/{user.totalCheckpoints} checkpoints</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-black h-2 rounded-full" 
                          style={{ width: `${user.progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{user.progressPercentage}% complete</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-700">
                    {formatTime(user.timeSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;