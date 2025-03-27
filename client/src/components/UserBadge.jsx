import { FiAward } from "react-icons/fi";
import React from "react";

const UserBadge = ({ level }) => {
    let badgeInfo = { label: "Beginner", color: "bg-gray-200" };
    
    if (level >= 10) badgeInfo = { label: "Expert", color: "bg-black" };
    else if (level >= 5) badgeInfo = { label: "Advanced", color: "bg-slate-700" };
    else if (level >= 3) badgeInfo = { label: "Intermediate", color: "bg-slate-500" };
    
    return (
        <div className={`text-white bg-black px-3 py-1 rounded-md inline-flex items-center`}>
            <FiAward className="mr-1" />
            <span>{badgeInfo.label}</span>
        </div>
    );
};

export default UserBadge;