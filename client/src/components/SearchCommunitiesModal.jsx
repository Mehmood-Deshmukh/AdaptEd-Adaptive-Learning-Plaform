import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchCommunitiesModal = ({ onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const modalRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        inputRef.current?.focus();
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/community/search?query=${encodeURIComponent(searchTerm)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                
                if (!response.ok) throw new Error("Search request failed");

                const data = await response.json();
                setSearchResults(data.data);
            } catch (error) {
                console.error("Error searching communities:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    const handleOutsideClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    const handleCommunityClick = (community) => {
        onSelect(community._id);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
            onClick={handleOutsideClick}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(5px)' }}
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search communities..."
                            className="w-full pl-10 pr-4 py-3 text-black placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {isSearching ? (
                        <div className="p-4 text-center text-gray-500">
                            Searching...
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {searchResults.map((community) => (
                                <div
                                    key={community._id}
                                    onClick={() => handleCommunityClick(community)}
                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-black">
                                                {community.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {community.membersCount} members
                                            </p>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            Click to view
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchTerm ? (
                        <div className="p-4 text-center text-gray-500">
                            No communities found
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Start typing to search communities
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchCommunitiesModal;