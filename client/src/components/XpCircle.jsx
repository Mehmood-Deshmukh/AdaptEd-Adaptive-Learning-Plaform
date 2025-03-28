import React from 'react';

const XpCircle = ({ xp, maxXp = 6000 }) => {
    const percentage = Math.min((xp / maxXp) * 100, 100);
    const circumference = 2 * Math.PI * 24;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Function to format XP with k for thousands
    const formatXP = (value) => {
        if (value >= 1000) {
            return `${Math.floor(value / 100) / 10}k`;
        }
        return value;
    };

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
            <div className="absolute text-center flex flex-col items-center justify-center">
                <div className="text-[10px] font-medium text-gray-500">XP</div>
                <div className={`font-bold ${xp >= 1000 ? 'text-xs' : 'text-sm'}`}>
                    {formatXP(xp)}
                </div>
            </div>
        </div>
    );
};

export default XpCircle;