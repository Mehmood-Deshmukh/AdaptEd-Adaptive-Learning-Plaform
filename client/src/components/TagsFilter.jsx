import React from "react";

const TagsFilter = ({ tags, activeTag, setActiveTag }) => {
	return (
		<>
			{tags.map((tag) => (
				<button
					key={tag}
					className={`px-4 py-1.5 rounded-md ${
						activeTag === tag
							? "bg-black text-white"
							: "border border-gray-300 text-black hover:bg-gray-50"
					}`}
					onClick={() => setActiveTag(tag)}
				>
					{tag}
				</button>
			))}
		</>
	);
};

export default TagsFilter;