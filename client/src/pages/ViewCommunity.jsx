import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import Sidebar from "../components/Sidebar";
import PostItem from "../components/PostItem";
import PostSkeleton from "../components/PostSkeleton";
import TrendingTopics from "../components/TrendingTopics";
import { TagIcon, Calendar, Users, Share2, MessageSquare } from "lucide-react";
import CreatePostModal from "../components/CreatePostModal";
import ChatRoom from "../components/Chatroom";

const CommunityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAuthContext();
  const { user } = state;
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      console.log("Fetching community data for ID:", id);
      const response = await fetch(`${backendUrl}/api/community/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch community data");
      }

      if (data.success) {
        console.log("Community data:", data.data);

        if (!data.data) {
          throw new Error("Community data is missing");
        }

        setCommunity(data.data);

        const communityPosts = Array.isArray(data.data.posts)
          ? data.data.posts
          : [];
        console.log("Posts data:", communityPosts);
        setPosts(communityPosts);

        if (user && user.communities && data.data._id) {
          setIsMember(user.communities.includes(data.data._id));
        }
      } else {
        throw new Error(data.message || "Failed to fetch community data");
      }
    } catch (error) {
      console.error("Error fetching community data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostVote = async (postId, type) => {
    if (!user) return;

    try {
      const postIndex = posts.findIndex((post) => post._id === postId);
      if (postIndex === -1) return;

      const post = posts[postIndex];

      const upvotes = Array.isArray(post.upvotes) ? post.upvotes : [];
      const downvotes = Array.isArray(post.downvotes) ? post.downvotes : [];

      let updatedPost = { ...post };

      if (type === "upvote") {
        if (upvotes.includes(user._id)) return;

        if (downvotes.includes(user._id)) {
          updatedPost.downvotes = downvotes.filter((id) => id !== user._id);
        }

        updatedPost.upvotes = [...upvotes, user._id];
      } else {
        if (downvotes.includes(user._id)) return;

        if (upvotes.includes(user._id)) {
          updatedPost.upvotes = upvotes.filter((id) => id !== user._id);
        }

        updatedPost.downvotes = [...downvotes, user._id];
      }

      const updatedPosts = [...posts];
      updatedPosts[postIndex] = updatedPost;
      setPosts(updatedPosts);

      const response = await fetch(`${backendUrl}/api/post/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ postId, userId: user._id }),
      });

      if (!response.ok) {
        setPosts(posts);
        console.error(`Error ${type}ing post: Server responded with an error`);
      }
    } catch (e) {
      setPosts(posts);
      console.error(`Error ${type}ing post:`, e);
    }
  };

  const handleChatToggle = (isOpen) => {
    setIsChatOpen(isOpen);
  };

  const handleJoinCommunity = async () => {
    try {
      if (!community || !community._id) {
        console.error("Cannot join/leave: Community ID is missing");
        return;
      }

      if (!isMember) {
        const response = await fetch(`${backendUrl}/api/user/join-community`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ communityId: community._id }),
        });

        const data = await response.json();
        if (data.success) {
          setIsMember(true);
          setCommunity({
            ...community,
            membersCount: (community.membersCount || 0) + 1,
          });

          if (user && Array.isArray(user.communities)) {
            const newUser = {
              ...user,
              communities: [...user.communities, community._id],
            };
            dispatch({ type: "UPDATE_USER", payload: newUser });
          }
        }
      } else {
        const response = await fetch(`${backendUrl}/api/user/leave-community`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ communityId: community._id }),
        });

        const data = await response.json();
        if (data.success) {
          setIsMember(false);
          setCommunity({
            ...community,
            membersCount: Math.max((community.membersCount || 1) - 1, 0),
          });

          if (user && Array.isArray(user.communities)) {
            const newUser = {
              ...user,
              communities: user.communities.filter(
                (communityId) => communityId !== community._id
              ),
            };
            dispatch({ type: "UPDATE_USER", payload: newUser });
          }
        }
      }
    } catch (error) {
      console.error("Error joining/leaving community:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCommunityData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar user={user} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
            <PostSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar user={user} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-white p-8 rounded-xl shadow-sm mb-6 text-center border border-red-100">
              <h2 className="text-2xl font-bold text-red-700">
                Error Loading Community
              </h2>
              <p className="mt-2 text-gray-700">{error}</p>
              <div className="mt-4">
                <button
                  onClick={() => fetchCommunityData()}
                  className="mr-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/forum")}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Back to Forum
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar user={user} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-white p-8 rounded-xl shadow-sm mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-700">
                Community Not Found
              </h2>
              <p className="mt-2 text-gray-500">
                The community data could not be loaded. Please check if the
                community exists.
              </p>
              <div className="mt-6 p-4 bg-gray-50 rounded text-left overflow-auto">
                <h3 className="text-md font-semibold mb-2">
                  Debug Information:
                </h3>
                <p className="text-sm font-mono">Community ID: {id}</p>
                <p className="text-sm font-mono">
                  Data received: {JSON.stringify({ community, posts }, null, 2)}
                </p>
              </div>
              <button
                onClick={() => navigate("/forum")}
                className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Back to Forum
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    community.name || "Community"
  )}`;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <img
                src={avatarUrl}
                alt={community.name || "Community"}
                className="w-24 h-24 rounded-xl object-cover border-4 border-gray-100 shadow-sm"
              />

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h1 className="text-3xl font-bold text-black">
                    {community.name || "Unnamed Community"}
                  </h1>

                  <div className="flex gap-3">
                    {community.createdBy === user._id ? null : (
                      <button
                        onClick={handleJoinCommunity}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          isMember
                            ? "bg-gray-200 text-black hover:bg-gray-300"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        {isMember ? "Leave Community" : "Join Community"}
                      </button>
                    )}

                    <CreatePostModal
                      posts= {posts}
                      setPosts={setPosts}
                      community={{
                        
                        _id: community._id,
                        name: community.name,
                        membersCount: community.membersCount,
                      }}
                    />

                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="px-4 py-2 rounded-md flex items-center gap-2 bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                      <MessageSquare size={18} />
                      <span>Chat</span>
                    </button>

                  </div>
                </div>

                <p className="mt-3 text-gray-600">
                  {community.description || "No description available"}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {community.domain && (
                    <div className="flex items-center">
                      <span className="font-medium">Domain:</span>
                      <span className="ml-1">{community.domain}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{community.membersCount || 0} members</span>
                  </div>

                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>Created {formatDate(community.createdAt)}</span>
                  </div>
                </div>

                {Array.isArray(community.tags) && community.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {community.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center"
                      >
                        <TagIcon size={14} className="mr-1.5" />
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <div className="py-2">
                <h2 className="text-xl font-bold text-black mb-2">
                  Recent Posts
                </h2>
                {/* <div className="border-t border-gray-700 pt-2"></div> */}
              </div>

              {!Array.isArray(posts) || posts.length === 0 ? (
                <>
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-medium text-gray-700 text-center">
                      No posts yet
                    </h3>
                    <p className="mt-2 text-gray-500 mb-3 text-center">
                      Be the first to post in this community!
                    </p>
                    <div className="w-fit mx-auto">
                      <CreatePostModal
                       posts= {posts}
                       setPosts={setPosts}
                        community={{
                          _id: community._id,
                          name: community.name,
                          membersCount: community.membersCount,
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                posts.map((post) => {
                  console.log("Rendering post:", post);
                  return (
                    <PostItem
                      key={post._id || `post-${Math.random()}`}
                      post={post}
                      user={user}
                      handleVote={handlePostVote}
                    />
                  );
                })
              )}
            </div>

            <div className="w-80 hidden md:block">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h3 className="text-lg font-bold text-black mb-3">
                  About Community
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {community.description || "No description available"}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar size={16} className="mr-2" />
                  <span>Created {formatDate(community.createdAt)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Users size={16} className="mr-2" />
                  <span>{community.membersCount || 0} members</span>
                </div>

                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert("Community link copied to clipboard!");
                  }}
                  className="flex items-center text-sm text-gray-700 hover:text-black transition-colors"
                >
                  <Share2 size={16} className="mr-2" />
                  <span>Share Community</span>
                </button>
              </div>

              <TrendingTopics />
            </div>
          </div>
        </div>
      </div>

	  {community && (
        <ChatRoom
          communityId={community._id}
          communityName={community.name}
          isOpen={isChatOpen}
          onClose={handleChatToggle}
        />
      )}

    </div>
  );
};

export default CommunityPage;
