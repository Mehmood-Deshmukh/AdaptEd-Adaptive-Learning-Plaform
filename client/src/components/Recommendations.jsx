import React, { useEffect, useState } from "react";
import { BookOpen, Video, Book, Link } from "lucide-react";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/get-recommendations`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        const data = await response.json();
        setRecommendations(data);

        console.log("Recommendations:", data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "tutorial":
        return <BookOpen className="text-black" />;
      case "reference":
        return <Book className="text-black" />;
      case "video":
        return <Video className="text-black" />;
      default:
        return <Link className="text-black" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold text-black mb-4">Recommended Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations?.map((resource, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors bg-white flex flex-col h-full"
          >
            <div className="flex items-center mb-2">
              {getIcon(resource.type)}
              <h3 className="font-medium text-black ml-2">{resource.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Difficulty:</strong> {resource.difficulty}
            </p>
            <div className="text-sm text-gray-600 mt-1">
              <strong>Tags:</strong>
              <div className="flex flex-wrap gap-1 mt-1">

                {resource.tags.map(tag => tag.replace(/_/g, ' ')).map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
            <strong>Topics:</strong> {resource.topics.map(topic => topic.replace(/_/g, ' ')).map(topic => topic.charAt(0).toUpperCase() + topic.slice(1)).join(", ")}
              
            </p>
            <div className="mt-auto pt-4">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white hover:bg-gray-700 inline-block px-4 py-2 rounded w-full text-center"
              >
                Access Resource
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;