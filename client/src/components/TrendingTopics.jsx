import React from "react";

const TrendingTopics = () => {
	return (
		<div className="bg-white p-6 rounded-xl shadow-sm mt-6 border border-gray-200">
			<h2 className="text-xl font-bold text-black mb-5">
				Trending Topics
			</h2>
			<div className="space-y-3">
				<div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
					<p className="font-medium text-black">#ReactHooks</p>
					<p className="text-gray-500 text-sm mt-1">2.3k posts</p>
				</div>
				<div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
					<p className="font-medium text-black">#WebAccessibility</p>
					<p className="text-gray-500 text-sm mt-1">1.8k posts</p>
				</div>
				<div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
					<p className="font-medium text-black">#TailwindCSS</p>
					<p className="text-gray-500 text-sm mt-1">1.5k posts</p>
				</div>
			</div>
		</div>
	);
};

export default TrendingTopics;