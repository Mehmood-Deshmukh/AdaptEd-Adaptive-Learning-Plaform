import React from 'react';

const XpCircle = ({ xp, maxXp = 6000 }) => {
    const percentage = Math.min((xp / maxXp) * 100, 100);
    const circumference = 2 * Math.PI * 24;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="w-16 h-16 rotate-[-90deg]">
                <circle
                    cx="32"
                    cy="32"
                    r="24"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                    fill="transparent"
                />
                <circle
                    cx="32"
                    cy="32"
                    r="24"
                    stroke="black"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    fill="transparent"
                />
            </svg>
            <div className="absolute text-center">
                <div className="text-xs font-medium">XP</div>
                <div className="font-bold text-sm">{xp}</div>
            </div>
        </div>
    );
};

export default XpCircle;