import React from 'react';
import { 
  Trophy, Award, BarChart2, Clock, BookOpen, Calendar, 
  Lightbulb, Zap, CheckCircle, ArrowRight, TrendingUp,
  Users, Target, Flame, Layers, GitBranch, Bookmark
} from "lucide-react";
  
const LeaderboardInsights = ({ roadmapInsights, leaderboard, currentUserPosition }) => {
    // Format time for display from minutes
    const formatTime = (minutes) => {
        if (!minutes && minutes !== 0) return "0 min";
        
        if (minutes >= 60) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${minutes} min`;
      };
      
      // Get current user from leaderboard
      const currentUser = leaderboard?.find((user) => 
        user.userId === localStorage.getItem('userId')
      );

      if (!roadmapInsights) {
        return (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm mb-4">
            <p className="text-gray-500">No insights data available yet.</p>
          </div>
        );
      }
  
    return (
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm mb-2">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Trophy className="h-7 w-7 text-yellow-500" />
          <h3 className="text-2xl font-bold text-center text-gray-900">
            Your Learning Performance Insights
          </h3>
        </div>
        
        {/* Top Stats - Quick Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-2">
              <Award className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {roadmapInsights?.userRank}
            </div>
            <div className="text-sm text-gray-500">
              Your Rank
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-2">
              <Target className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {roadmapInsights?.progressComparison.userProgress}%
            </div>
            <div className="text-sm text-gray-500">
              Completion
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-2">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {roadmapInsights?.streakComparison.yourStreak}
            </div>
            <div className="text-sm text-gray-500">
              Day Streak
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-2">
              <Layers className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {roadmapInsights?.consistencyComparison.yourConsistency}%
            </div>
            <div className="text-sm text-gray-500">
              Consistency
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Ranking Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-yellow-50 mr-4">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  Your Ranking
                </h4>
                <p className="text-gray-700">
                  You are ranked <span className="font-bold text-gray-900">
                    {roadmapInsights?.userRank}
                  </span> out of {roadmapInsights?.totalParticipants} learners
                </p>
                <div className="h-2 bg-gray-100 rounded-full my-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${roadmapInsights?.progressComparison.percentilRank}%`,
                    }}
                    title={`${roadmapInsights?.progressComparison.percentilRank}th percentile`}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  You're in the top {100 - roadmapInsights?.progressComparison.percentilRank}%
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress Comparison Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-blue-50 mr-4">
                <BarChart2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  Progress Comparison
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="block text-sm text-gray-500">
                      Your Progress
                    </span>
                    <span className="font-semibold text-lg text-gray-900">
                      {roadmapInsights?.progressComparison.userProgress}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Average
                    </span>
                    <span className="font-semibold text-lg text-gray-900">
                      {roadmapInsights?.progressComparison.averageProgress}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Top Performer
                    </span>
                    <span className="font-semibold text-lg text-gray-900">
                      {roadmapInsights?.progressComparison.topPerformerProgress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Time Efficiency Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-purple-50 mr-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  Time Efficiency
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Your Average:</span>
                    <span className="font-semibold text-gray-900">{formatTime(roadmapInsights?.timeComparison.userAverageTime)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Leader's Average:</span>
                    <span className="font-semibold text-gray-900">{formatTime(roadmapInsights?.timeComparison.leaderAverageTime)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Overall Average:</span>
                    <span className="font-semibold text-gray-900">{formatTime(roadmapInsights?.timeComparison.averageTimeAllUsers)}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-right">Time per checkpoint</div>
              </div>
            </div>
          </div>
          
          {/* Consistency Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-orange-50 mr-4">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  Learning Consistency
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Your Consistency:</span>
                    <span className="font-semibold text-gray-900">{roadmapInsights?.consistencyComparison.yourConsistency}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Top Performer:</span>
                    <span className="font-semibold text-gray-900">{roadmapInsights?.consistencyComparison.topPerformerConsistency}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Current Streak:</span>
                    <span className="font-semibold text-gray-900">{roadmapInsights?.streakComparison.yourStreak} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Learning Style Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-indigo-50 mr-4">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  Learning Style
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Your Style</div>
                    <div className="font-semibold text-gray-900">{roadmapInsights?.learningStyleComparison.yourStyle}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Top Performers' Style</div>
                    <div className="font-semibold text-gray-900">{roadmapInsights?.learningStyleComparison.topPerformerStyles[0]}</div>
                  </div>
                  
                  {roadmapInsights?.topics.yourFavorites && roadmapInsights.topics.yourFavorites.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500">Your Favorite Topics</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {roadmapInsights.topics.yourFavorites.slice(0, 2).map((topic, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                            <Bookmark className="h-3 w-3 mr-1" />
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Study Patterns */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-green-50 mr-4">
                <GitBranch className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  Study Patterns
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Your Peak Time</div>
                    <div className="font-semibold text-gray-900">{roadmapInsights?.studyPatterns.yourPattern}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Top Performers' Time</div>
                    <div className="font-semibold text-gray-900">{roadmapInsights?.studyPatterns.topPerformerPatterns[0]}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Weekday/Weekend Ratio</div>
                    <div className="font-semibold text-gray-900">{roadmapInsights?.studyPatterns.yourWeekdayWeekendRatio}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Insights Section */}
        {roadmapInsights?.topPerformerInsights && roadmapInsights.topPerformerInsights.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-4">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-blue-50 mr-4">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-900 mb-3">
                  What Top Performers Are Doing Differently
                </h4>
                <ul className="space-y-3 text-gray-700">
                  {roadmapInsights.topPerformerInsights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Recommendations Section */}
        {roadmapInsights?.recommendations && roadmapInsights.recommendations.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-green-50 mr-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-900 mb-3">
                  Recommendations For You
                </h4>
                <ul className="space-y-3 text-gray-700">
                  {roadmapInsights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-400">
          Last updated: {new Date(roadmapInsights?.timestamp || Date.now()).toLocaleString()}
        </div>
      </div>
    );
  };
  
  export default LeaderboardInsights;