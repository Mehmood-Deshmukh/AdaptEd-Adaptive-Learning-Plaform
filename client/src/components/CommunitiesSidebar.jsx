import React from "react";
import { formatNumber } from "../utils/helpers";
import useAuthContext from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const CommunitiesSidebar = ({ communities, handleJoinCommunity }) => {
	const navigate = useNavigate();
	const { state } = useAuthContext();
	const { user } = state;
	return (
		<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
			<h2 className="text-xl font-bold text-black mb-5">
				Communities to Join
			</h2>
			{communities.map((community) => (
				<div
					onClick={() => navigate(`/community/${community._id}`)}
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
								className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
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
	);
};

export default CommunitiesSidebar;
