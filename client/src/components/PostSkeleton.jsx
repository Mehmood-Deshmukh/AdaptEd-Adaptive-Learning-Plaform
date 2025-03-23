import React from "react";

const PostSkeleton = () => {
	return (
		<div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200">
			<div className="animate-pulse">
				<div className="flex items-start">
					<div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
					<div className="flex-1">
						<div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
						<div className="h-6 bg-gray-200 rounded w-1/2"></div>
					</div>
				</div>
				<div className="mt-4 h-16 bg-gray-200 rounded"></div>
				<div className="mt-4 h-48 bg-gray-200 rounded"></div>
			</div>
		</div>
	);
};

export default PostSkeleton;