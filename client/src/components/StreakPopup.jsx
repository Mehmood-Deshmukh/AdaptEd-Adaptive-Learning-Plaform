import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const StreakPopup = ({ streak, isVisible, onClose }) => {
  const [animationState, setAnimationState] = useState('initial');
  
  useEffect(() => {
    if (isVisible) {
      // Start entrance animation
      setAnimationState('animate-in');
      
      // Set up auto-close timer
      const timer = setTimeout(() => {
        setAnimationState('animate-out');
        setTimeout(() => {
          if (onClose) onClose();
        }, 500); // Match this with CSS animation duration
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
  
  if (!isVisible) return null;
  
  const getStreakMessage = (streak) => {
    if (streak === 1) return "First day - welcome back!";
    if (streak === 7) return "One week streak!";
    if (streak === 30) return "One month streak!";
    if (streak === 365) return "One year streak!";
    if (streak % 100 === 0) return `${streak} day milestone!`;
    if (streak % 10 === 0) return `${streak} day streak!`;
    return `${streak} day streak!`;
  };
  
  const animationClasses = {
    'initial': 'opacity-0 translate-y-8',
    'animate-in': 'opacity-100 translate-y-0 transition-all duration-500 ease-out',
    'animate-out': 'opacity-0 translate-y-8 transition-all duration-500 ease-in'
  };
  
  return (
    <div 
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 ${animationClasses[animationState]}`}
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-xl p-6 flex flex-col items-center max-w-md">
        <div className="relative w-16 h-16 mb-4">
          {/* Animated fire background for streak icon */}
          <div className="absolute inset-0 bg-orange-500 rounded-full opacity-25 animate-pulse"></div>
          
          {/* Circular progress */}
          <svg className="w-16 h-16 absolute" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="rgba(255,255,255,0.2)" 
              strokeWidth="8"
            />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="white" 
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * Math.min(streak/100, 1))}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Flame icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🔥</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-1">Streak Updated!</h3>
        <p className="text-3xl font-bold mb-2">{streak}</p>
        <p className="text-center text-white text-opacity-90">
          {getStreakMessage(streak)}
        </p>
        
        {/* Confetti animation for milestone streaks */}
        {(streak % 10 === 0 || streak === 7) && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-300 animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1500}ms`,
                  animationDuration: `${1000 + Math.random() * 1500}ms`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// Add this CSS to your global styles
const globalStyles = `
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0);
    opacity: 1;
  }
  100% {
    transform: translateY(100px) rotate(720deg);
    opacity: 0;
  }
}
.animate-confetti {
  animation: confetti 1.5s ease-out forwards;
}
`;

export default StreakPopup;