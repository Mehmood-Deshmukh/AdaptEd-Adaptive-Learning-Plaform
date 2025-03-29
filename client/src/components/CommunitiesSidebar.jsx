import React from "react";
import { useState } from "react";
import { formatNumber } from "../utils/helpers";
import useAuthContext from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const CommunitiesSidebar = ({ communities, handleJoinCommunity }) => {
	const navigate = useNavigate();
	const { state } = useAuthContext();
	const [loading, setLoading] = useState(false);
	const { user } = state;
	const handleJoinClick = (id) => {
		setLoading(true);  // Show full-page spinner
		setTimeout(() => {
			navigate(`/community/${id}`);
			setLoading(false);  // Reset loading
		}, 500); 
	}

	return (
		<>
		{/* Full-page spinner */}
		{loading && (
			<div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
				<div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
			</div>
		)}


		<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
			<h2 className="text-xl font-bold text-black mb-5">
				Communities to Join
			</h2>
			{communities.map((community) => (
				<div
					onClick={() => handleJoinClick(community._id)}
					key={community.id || community._id}
					className="mb-5 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 cursor-pointer"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-black text-lg">
								{community.name}
							</p>
							<p className="text-gray-500 text-sm mt-1">
								{formatNumber(community.membersCount)} members
							</p>
						</div>

						{community.createdBy != user._id && (
							<button
								className={`px-4 py-1.5 rounded-md text-sm font-medium cursor-pointer transition ${
									community.joined
										? "bg-gray-200 text-black hover:bg-gray-300"
										: "bg-black text-white hover:bg-gray-800"
								}`}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();

									handleJoinCommunity(
										community.id || community._id
									);
								}}
							>
								{community.joined ? "Joined" : "Join"}
							</button>
						)}
					</div>
				</div>
			))}
			<button className="w-full mt-3 text-center text-black font-medium py-2 hover:bg-gray-50 rounded-lg transition">
				View All Communities
			</button>
		</div>
		</>
	);
};

export default CommunitiesSidebar;
