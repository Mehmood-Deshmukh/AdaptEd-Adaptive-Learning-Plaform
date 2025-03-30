import React from "react";
import { useNavigate } from "react-router-dom";

const CheckpointActionButtons = ({ topic }) => {
	const navigate = useNavigate();
	return (
		<div className="flex flex-wrap gap-3 mt-4">
			<button
            onClick={() => navigate('/quiz-generator?topic=' + topic)}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-300 font-medium text-sm">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-4 h-4 mr-2"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					/>
				</svg>
				Take quiz on this checkpoint
			</button>

			<button className="flex items-center px-4 py-2 bg-white text-gray-800 border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-300 font-medium text-sm">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-4 h-4 mr-2 text-gray-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
					/>
				</svg>
				Try coding challenge
			</button>

			<button 
                onClick={() => navigate('/subjective-answers?topic=' + topic)}
            className="flex items-center px-4 py-2 bg-white text-gray-800 border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-300 font-medium text-sm">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-4 h-4 mr-2 text-gray-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				Let AI ask you a question
			</button>
		</div>
	);
};

export default CheckpointActionButtons;
