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
  
  // Animation classes with proper transitions
  const animationClasses = {
    'initial': 'opacity-0 translate-y-8',
    'animate-in': 'opacity-100 translate-y-0 transition-all duration-500 ease-out',
    'animate-out': 'opacity-0 translate-y-8 transition-all duration-500 ease-in'
  };
  
  return (
    <div 
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 ${animationClasses[animationState]}`}
    >
      <div className="bg-white border border-gray-200 text-black rounded-lg shadow-xl p-6 flex flex-col items-center max-w-md">
        <div className="relative w-16 h-16 mb-4">
          {/* Animated background for streak icon */}
          <div className="absolute inset-0 bg-amber-100 rounded-full opacity-75 animate-pulse"></div>
          
          {/* Circular progress */}
          <svg className="w-16 h-16 absolute" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="rgba(0,0,0,0.1)" 
              strokeWidth="8"
            />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="#FF6B00" 
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * Math.min(streak/100, 1))}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-out"
              style={{transition: "stroke-dashoffset 1.5s ease-out"}}
            />
          </svg>
          
          {/* Flame icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl animate-bounce" style={{animationDuration: "2s"}}>🔥</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-1 text-gray-800">Streak Updated!</h3>
        <p className="text-3xl font-bold mb-2 text-orange-500">{streak}</p>
        <p className="text-center text-gray-700">
          {getStreakMessage(streak)}
        </p>
        
        {/* Confetti animation for milestone streaks */}
        {(streak % 10 === 0 || streak % 7 == 0) && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full animate-confetti"
                style={{
                  width: `${Math.max(4, Math.random() * 8)}px`,
                  height: `${Math.max(4, Math.random() * 8)}px`,
                  backgroundColor: ['#FF6B00', '#FFD700', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 4)],
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

// Add this CSS to your global styles or include it in your component
const GlobalStyles = () => (
  <style jsx global>{`
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
    
    /* Fix for the bounce animation */
    @keyframes custom-bounce {
      0%, 100% {
        transform: translateY(-5%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
      }
      50% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }
    }
    .animate-bounce {
      animation: custom-bounce 1s infinite;
    }
  `}</style>
);

// Export the component with the styles
const StreakPopupWithStyles = (props) => (
  <>
    <GlobalStyles />
    <StreakPopup {...props} />
  </>
);

export default StreakPopupWithStyles;