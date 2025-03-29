import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiBook } from "react-icons/fi";

const RoadmapDetails = ({ roadmap }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getProgressPercentage = () => {
        const completedCheckpoints = roadmap.checkpoints.filter(
            (checkpoint) => checkpoint.status === "completed"
        ).length;
        return Math.round(
            (completedCheckpoints / roadmap.checkpoints.length) * 100
        );
    };

    return (
        <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
            <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => {
                    setIsExpanded(!isExpanded)
                }}
            >
                <div className="flex items-center flex-grow">
                    <FiBook className="mr-3 text-gray-700" size={20} />
                    <div className="flex-grow">
                        <h3 className="font-medium text-lg">{roadmap.mainTopic}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                            {roadmap.description}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div
                                className="bg-black h-2.5 rounded-full"
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                        <div className="text-sm text-gray-600">
                            Progress: {getProgressPercentage()}% | {roadmap.checkpoints.length} Checkpoints
                        </div>
                    </div>
                </div>
                {isExpanded ? (
                    <FiChevronUp className="text-gray-600 ml-2" size={20} />
                ) : (
                    <FiChevronDown className="text-gray-600 ml-2" size={20} />
                )}
            </div>

            {isExpanded && (
                <div className="mt-4 border-t pt-4">
                    {roadmap.checkpoints.map((checkpoint, index) => (
                        <div
                            key={checkpoint._id}
                            className={`mb-4 pb-4 ${
                                index < roadmap.checkpoints.length - 1
                                    ? "border-b"
                                    : ""
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium">
                                        {checkpoint.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {checkpoint.description}
                                    </p>
                                    <div className="text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                checkpoint.status === "completed"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {checkpoint.status}
                                        </span>
                                        <span className="ml-2 text-gray-600">
                                            Est. Time: {checkpoint.totalHoursNeeded} hours
                                        </span>
                                    </div>
                                </div>
                                {checkpoint.status === "completed" && (
                                    <div className="text-sm text-gray-600">
                                        Completed: {new Date(checkpoint.completedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            {checkpoint.resources && checkpoint.resources.length > 0 && (
                                <div className="mt-3">
                                    <h5 className="text-sm font-semibold mb-2">
                                        Resources:
                                    </h5>
                                    <div className="space-y-2">
                                        {checkpoint.resources.map(
                                            (resource) => (
                                                <a
                                                    key={resource._id}
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block text-sm text-blue-600 hover:underline"
                                                >
                                                    {resource.name} ({resource.type})
                                                </a>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoadmapDetails;