import TagsFilter from "./TagsFilter";
import { Filter, Plus, Flame, BookOpen, Search, StretchVertical } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import CreateCommunityModal from "./CreateCommunityModal";

const ForumHeader = ({ tags, activeTag, setActiveTag }) => {
    return (
      <div className="z-10 bg-white pt-6 pb-3 px-6 shadow-sm mt-5 rounded-xl mx-auto max-h-[30vh]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">
            AdaptEd Community Forum
          </h1>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-black text-white rounded-lg">
              <Search size={18} />
              <span>Search</span>
            </button>
          </div>
        </div>
  
        <div className="flex space-x-4 mb-6">
          <CreatePostModal />
          {/* <button
          className="flex items-center space-x-2 px-5 py-2.5 border border-black text-black rounded-lg hover:bg-gray-50 transition">
            <Plus size={18} />
            <span>Create Community</span>
          </button> */}
          <CreateCommunityModal />
          <button className="flex items-center space-x-2 px-5 py-2.5 border border-black text-black rounded-lg hover:bg-gray-50 transition">
            <Flame size={18} />
            <span>Trending</span>
          </button>
          <button className="flex items-center space-x-2 px-5 py-2.5 border border-black text-black rounded-lg hover:bg-gray-50 transition">
            <BookOpen size={18} />
            <span>Resources</span>
          </button>
        </div>
  
        <div className="flex items-center space-x-3 overflow-x-auto pb-3 mb-2">
          <div className="flex items-center space-x-1 px-3 py-1.5 bg-black text-white rounded-md">
            <Filter size={14} />
            <span>Filter:</span>
          </div>
          <TagsFilter
            tags={tags}
            activeTag={activeTag}
            setActiveTag={setActiveTag}
          />
        </div>
      </div>
    );
  };

  export default ForumHeader;