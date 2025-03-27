import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Users, Globe, UserCircle2, Users as UsersIcon } from 'lucide-react';

const SearchModal = ({ onClose, onSelect, searchType = 'all' }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentSearchType, setCurrentSearchType] = useState(searchType);
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
                    `${import.meta.env.VITE_BACKEND_URL}/api/publicprofile/search?query=${encodeURIComponent(searchTerm)}&type=${currentSearchType}`,
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
                console.error("Error searching entities:", error);
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
    }, [searchTerm, currentSearchType]);

    const handleOutsideClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    const handleEntityClick = (entity) => {
        onSelect(entity._id, entity.type);
        onClose();
    };

    const renderSearchTypeToggle = () => {
        const searchTypes = [
            { type: 'all', icon: <Globe size={16} />, label: 'All' },
            { type: 'communities', icon: <UsersIcon size={16} />, label: 'Communities' },
            { type: 'users', icon: <UserCircle2 size={16} />, label: 'Users' }
        ];

        return (
            <div className="flex justify-center space-x-2 mb-2 border-b border-gray-200 pb-2">
                {searchTypes.map((type) => (
                    <button
                        key={type.type}
                        onClick={() => setCurrentSearchType(type.type)}
                        className={`
                            flex items-center space-x-1 px-3 py-1 rounded-md text-sm 
                            ${currentSearchType === type.type 
                                ? 'bg-black text-white' 
                                : 'text-gray-600 hover:bg-gray-100'}
                            transition-colors
                        `}
                    >
                        {type.icon}
                        <span>{type.label}</span>
                    </button>
                ))}
            </div>
        );
    };

    const renderResultItem = (entity) => {
        const isUser = entity.type === 'user';
        const isComm = entity.type === 'community';

        return (
            <div
                key={entity._id}
                onClick={() => handleEntityClick(entity)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex items-center space-x-4"
            >
                {/* Avatar/Icon */}
                <div className="flex-shrink-0">
                    {isUser ? (
                        <UserCircle2 
                            className="text-gray-400" 
                            size={40} 
                            strokeWidth={1.5} 
                        />
                    ) : (
                        <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                            <UsersIcon 
                                className="text-gray-600" 
                                size={24} 
                                strokeWidth={1.5} 
                            />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-grow">
                    <h3 className="text-lg font-medium text-black">
                        {entity.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {isComm 
                            ? `${entity.membersCount} members` 
                            : `${entity.followers?.length || 0} followers`}
                    </p>
                </div>

                {/* View Action */}
                <div className="text-sm text-gray-400 flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-wider">
                        View {entity.type}
                    </span>
                    {isUser ? (
                        <UserCircle2 size={16} className="text-gray-400" />
                    ) : (
                        <Globe size={16} className="text-gray-400" />
                    )}
                </div>
            </div>
        );
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
                    {renderSearchTypeToggle()}
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={`Search ${currentSearchType}...`}
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
                        <div>
                            {searchResults.map(renderResultItem)}
                        </div>
                    ) : searchTerm ? (
                        <div className="p-4 text-center text-gray-500">
                            No results found
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Start typing to search {currentSearchType}
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

export default SearchModal;