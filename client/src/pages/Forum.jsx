import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import Sidebar from "../components/Sidebar";
import CreatePostModal from "../components/CreatePostModal";
import PostItem from "../components/PostItem";
import PostSkeleton from "../components/PostSkeleton";
import CommunitiesSidebar from "../components/CommunitiesSidebar";
import TrendingTopics from "../components/TrendingTopics";
import ForumHeader from "../components/ForumHeader";
import { placeholderCommunities, placeholderPosts, tags } from "../utils/lib";

const Forum = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAuthContext();
  const { user } = state;
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);


  const handleCommentSubmit = (postId) => {
    if (!newComment.trim()) return;
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
    setNewComment("");
  };

  const handleVote = (postId, type) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              upvotes:
                type === "upvote" ? [...post.upvotes, user?.id] : post.upvotes,
              downvotes:
                type === "downvote"
                  ? [...post.downvotes, user?.id]
                  : post.downvotes,
            }
          : post
      )
    );
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/post/?page=1&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setPosts(data.data);
      } else {
        setPosts(placeholderPosts);
      }
    } catch (e) {
      console.error("Error fetching posts:", e);
      setPosts(placeholderPosts);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/community/?page=1&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCommunities(data.data);
      } else {
        setCommunities(placeholderCommunities);
      }
    } catch (e) {
      console.error("Error fetching communities:", e);
      setCommunities(placeholderCommunities);
    }
  };

  const handleJoinCommunity = (communityId) => {
    setCommunities(
      communities.map((community) =>
        community.id === communityId || community._id === communityId
          ? { ...community, joined: !community.joined }
          : community
      )
    );
  };

  useEffect(() => {
    fetchPosts();
    fetchCommunities();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-8xl mx-auto px-6">
          <ForumHeader
            tags={tags}
            activeTag={activeTag}
            setActiveTag={setActiveTag}
          />

          <div className="flex pt-6 gap-6">
            <div className="flex-1">
              {loading ? (
                <PostSkeleton />
              ) : posts.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200 text-center">
                  <p className="text-lg text-gray-500">No posts found</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostItem
                    key={post._id}
                    post={post}
                    user={user}
                    handleVote={handleVote}
                  />
                ))
              )}
            </div>

            <div className="w-80">
              <CommunitiesSidebar
                communities={communities}
                handleJoinCommunity={handleJoinCommunity}
                user={state.user}
              />
              <TrendingTopics />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Forum;