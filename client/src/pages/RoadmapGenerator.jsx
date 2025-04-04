import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  Book,
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Youtube,
  Globe,
  Award,
  Plus,
  ExternalLink,
  Loader,
  Search,
  Lock,
  Check,
  Tag,
  Info,
  Bookmark,
  Star,
  File,
  Users,
  Trophy,
  BarChart,
  FastForward,
  Rocket,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import useAuthContext from "../hooks/useAuthContext";
import { Toast } from "primereact/toast";
import LeaderboardModal from "../components/LeaderboardModal";
import StyleTag from "../components/StyleTag";
import FeedbackModal from "../components/FeedbackModal";
import CheckpointFeedbackSummary from "../components/CheckpointFeedbackSummary";
import LeaderboardInsights from "../components/LeaderboardInsigths";
import CheckpointActionButtons from "../components/CheckpointButtons";

const RoadmapGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [topic, setTopic] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [roadmapInsights, setRoadmapInsights] = useState(null);
  const [leaderboardDataProp, setLeaderboardDataProp] = useState([]);
  const [currentUserPosition, setCurrentUserPosition] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const { state } = useAuthContext();
  const { user } = state;
  const toast = useRef(null);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchLeaderboard = async (roadmapId) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/roadmap/leaderboard/${roadmapId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const data = await response.json();
      setLeaderboardData(data);
      setIsLoading(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load leaderboard data. Please try again.",
        life: 3000,
      });
      setIsLoading(false);
    }
  };

  const fetchRoadmapInsights = async (roadmapId) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/roadmap/leaderboard-insights/${roadmapId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch leaderboard insights"
        );
      }

      const data = await response.json();

      // Store all the data properly for use in components
      setRoadmapInsights(data.insights);
      setLeaderboardDataProp(data.leaderboard);
      setCurrentUserPosition(data.currentUserPosition);
    } catch (error) {
      console.error("Leaderboard insights error:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          error.message ||
          "Failed to load leaderboard insights. Please try again.",
        life: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/roadmap/get`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch roadmaps");

      const data = await response.json();

      const updatedRoadmaps = data.map((roadmap) => {
        if (roadmap.checkpoints && roadmap.checkpoints.length > 0) {
          const checkpoint1 = roadmap.checkpoints.find((cp) => cp.order === 1);
          const isCheckpoint1Completed =
            checkpoint1 && checkpoint1.status === "completed";

          roadmap.checkpoints = roadmap.checkpoints.map((checkpoint) => {
            if (
              checkpoint.order === 1 &&
              checkpoint.status !== "completed" &&
              checkpoint.status != "in_progress"
            ) {
              fetch(`${BASE_URL}/api/roadmap/update-checkpoint-status`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                  roadmapId: roadmap._id,
                  checkpointId: checkpoint._id,
                  status: "in_progress",
                }),
              }).catch((error) =>
                console.error("Error updating checkpoint status:", error)
              );

              return { ...checkpoint, status: "in_progress" };
            } else if (
              checkpoint.order === 2 &&
              isCheckpoint1Completed &&
              checkpoint.status === "not_started" &&
              checkpoint.status != "in_progress"
            ) {
              fetch(`${BASE_URL}/api/roadmap/update-checkpoint-status`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                  roadmapId: roadmap._id,
                  checkpointId: checkpoint._id,
                  status: "in_progress",
                }),
              }).catch((error) =>
                console.error("Error updating checkpoint status:", error)
              );

              return { ...checkpoint, status: "in_progress" };
            } else if (checkpoint.order > 1) {
              const prevCheckpoint = roadmap.checkpoints.find(
                (cp) => cp.order === checkpoint.order - 1
              );

              if (
                prevCheckpoint &&
                prevCheckpoint.status === "completed" &&
                checkpoint.status === "not_started" &&
                checkpoint.status != "in_progress"
              ) {
                fetch(`${BASE_URL}/api/roadmap/update-checkpoint-status`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                  },
                  body: JSON.stringify({
                    roadmapId: roadmap._id,
                    checkpointId: checkpoint._id,
                    status: "in_progress",
                  }),
                }).catch((error) =>
                  console.error("Error updating checkpoint status:", error)
                );

                return { ...checkpoint, status: "in_progress" };
              }
            }
            return checkpoint;
          });
        }
        return roadmap;
      });

      setRoadmaps(updatedRoadmaps);
      setIsLoading(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load roadmaps. Please try again.",
        life: 3000,
      });
      setIsLoading(false);
    }
  };

  const generateRoadmap = async () => {
    if (!topic.trim()) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Please enter a topic to generate a roadmap",
        life: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      setShowModal(false);

      const response = await fetch(`${BASE_URL}/api/roadmap/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error("Failed to generate roadmap");

      const data = await response.json();
      let updatedData = { ...data };

      const successMessage = data.isExisting
        ? "You've joined an existing roadmap for this topic!"
        : "Roadmap generated successfully!";

      if (data.checkpoints && data.checkpoints.length > 0) {
        const firstCheckpoint = data.checkpoints.find((cp) => cp.order === 1);

        if (firstCheckpoint) {
          await fetch(`${BASE_URL}/api/roadmap/update-checkpoint-status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              roadmapId: data._id,
              checkpointId: firstCheckpoint._id,
              status: "in_progress",
            }),
          });

          updatedData.checkpoints = data.checkpoints.map((checkpoint) => {
            if (checkpoint.order === 1) {
              return { ...checkpoint, status: "in_progress" };
            } else {
              return { ...checkpoint, status: "not_started" };
            }
          });
        }
      }

      setRoadmaps([...roadmaps, updatedData]);
      setSelectedRoadmap(updatedData);
      setTopic("");
      setIsLoading(false);

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: successMessage,
        life: 3000,
      });

      if (data.isExisting && data.users && data.users.length > 1) {
        toast.current.show({
          severity: "info",
          summary: "Learning Together",
          detail: `You're learning with ${
            data.users.length - 1
          } other students!`,
          life: 5000,
        });
      }
    } catch (error) {
      console.log(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to generate roadmap. Please try again.",
        life: 3000,
      });
      setIsLoading(false);
    }
  };

  const openLeaderboard = () => {
    if (!selectedRoadmap) return;

    fetchLeaderboard(selectedRoadmap._id);
    setShowLeaderboard(true);
  };

  const isCheckpointLocked = (checkpoints, currentCheckpoint) => {
    if (currentCheckpoint.order === 1) return false;

    const previousCheckpoint = checkpoints.find(
      (cp) => cp.order === currentCheckpoint.order - 1
    );

    return previousCheckpoint && previousCheckpoint.status !== "completed";
  };

  const updateCheckpointStatus = async (roadmapId, checkpointId, newStatus) => {
    try {
      const roadmap = roadmaps.find((r) => r._id === roadmapId);
      const checkpoint = roadmap.checkpoints.find(
        (cp) => cp._id === checkpointId
      );

      if (
        isCheckpointLocked(roadmap.checkpoints, checkpoint) &&
        newStatus === "completed"
      ) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Complete the previous checkpoint first",
          life: 3000,
        });
        return;
      }

      setIsLoading(true);

      const response = await fetch(
        `${BASE_URL}/api/roadmap/update-checkpoint-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            roadmapId,
            checkpointId,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update checkpoint");
      }

      const data = await response.json();
      const updatedRoadmap = data;

      const updatedRoadmaps = roadmaps.map((roadmap) => {
        if (roadmap._id === roadmapId) {
          if (selectedRoadmap && selectedRoadmap._id === roadmapId) {
            setSelectedRoadmap(updatedRoadmap);
          }
          return updatedRoadmap;
        }
        return roadmap;
      });

      setRoadmaps(updatedRoadmaps);
      setIsLoading(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Checkpoint status updated successfully",
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update checkpoint status. Please try again.",
        life: 3000,
      });
      setIsLoading(false);
    }
  };

  const calculateProgress = (checkpoints) => {
    if (!checkpoints || checkpoints.length === 0) return 0;

    const completedCount = checkpoints.filter(
      (cp) => cp.status === "completed"
    ).length;
    return Math.round((completedCount / checkpoints.length) * 100);
  };

  const getResourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "documentation":
      case "official documentation":
        return <FileText className="w-4 h-4 mr-2 text-black" />;
      case "video tutorial":
        return <Youtube className="w-4 h-4 mr-2 text-black" />;
      case "interactive tutorial":
      case "course":
        return <Book className="w-4 h-4 mr-2 text-black" />;
      case "community forum":
        return <Globe className="w-4 h-4 mr-2 text-black" />;
      default:
        return <File className="w-4 h-4 mr-2 text-black" />;
    }
  };

  const getStatusIcon = (status, isLocked) => {
    if (isLocked) {
      return <Lock className="w-5 h-5 text-gray-500" />;
    }

    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "not_started":
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status, isLocked) => {
    if (isLocked) {
      return "bg-gray-200 text-gray-500 border-gray-300 opacity-70";
    }

    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "not_started":
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleFeedbackSubmitted = (roadmapId, checkpointId) => {
    const roadmap = roadmaps.find((r) => r._id === roadmapId);
    if (!roadmap) return;

    const updatedCheckpoints = roadmap.checkpoints.map((cp) => {
      if (cp._id === checkpointId) {
        const updatedUserProgress = cp.userProgress.map((up) => {
          if (up.userId === user._id) {
            return {
              ...up,
              isFeedbackCompleted: true,
            };
          }
          return up;
        });

        return {
          ...cp,
          userProgress: updatedUserProgress,
          isFeedbackCompleted: true,
        };
      }
      return cp;
    });

    const updatedRoadmap = {
      ...roadmap,
      checkpoints: updatedCheckpoints,
    };

    setRoadmaps(
      roadmaps.map((r) => (r._id === roadmapId ? updatedRoadmap : r))
    );

    if (selectedRoadmap && selectedRoadmap._id === roadmapId) {
      setSelectedRoadmap(updatedRoadmap);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const formatTimeDuration = (milliseconds) => {
    if (!milliseconds) return "0 min";

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const CheckpointItem = ({ checkpoint, roadmapId, checkpoints }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [feedbackData, setFeedbackData] = useState(null);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
    const locked = isCheckpointLocked(checkpoints, checkpoint);

    const currentUserProgress = checkpoint.userProgress.find(
      (up) => up.userId === user?._id
    );

    const isFeedbackCompleted = currentUserProgress?.isFeedbackCompleted;

    const handleOpenFeedbackModal = (e) => {
      e.stopPropagation();
      setSelectedCheckpoint(checkpoint);
      setShowFeedbackModal(true);
    };

    useEffect(() => {
      if (checkpoint.status === "completed") {
        fetchFeedbackData(checkpoint._id);
      }
    }, [checkpoint._id]);

    const fetchFeedbackData = async (checkpointId) => {
      try {
        setIsFeedbackLoading(true);
        const response = await fetch(
          `${BASE_URL}/api/roadmap/feedback/user/checkpoint/${checkpointId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setFeedbackData(data);
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setIsFeedbackLoading(false);
      }
    };

    const calculateTimeSpent = () => {
      if (checkpoint?.status === "completed" && checkpoint?.totalTimeTaken) {
        return formatTimeDuration(checkpoint.totalTimeTaken);
      } else if (
        checkpoint?.status === "in_progress" &&
        checkpoint?.startedAt
      ) {
        const currentTime = Date.now();
        const startTime = new Date(checkpoint.startedAt).getTime();
        return formatTimeDuration(currentTime - startTime);
      }
      return "0 min";
    };

    const ResourceItem = ({ resource }) => {
      if (
        resource.name &&
        resource.tags &&
        resource.difficulty &&
        resource.topics
      ) {
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                {getResourceIcon(resource.type)}
                {resource.name}
              </h4>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gray-800 text-white text-xs rounded-full font-medium">
                  {resource.difficulty}
                </span>
              </div>
            </div>
    
            <p className="text-gray-700 text-sm mb-4">{resource.description}</p>
            
            {/* Reasoning & Rank Section */}
            {(resource?.reasoning || resource?.rank) && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                {resource?.reasoning && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reasoning</span>
                    <p className="text-gray-800 mt-1 text-sm">{resource.reasoning}</p>
                  </div>
                )}
                {resource?.rank && (
                  <div className="flex items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">Rank</span>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900">{resource.rank}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
    
            <div className="space-y-3">
              {resource.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center"
                    >
                      <Tag className="w-3 h-3 mr-1.5 text-gray-500" /> {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {resource.topics?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {resource.topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center"
                    >
                      <Bookmark className="w-3 h-3 mr-1.5 text-gray-500" /> {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
    
            <div className="mt-4 pt-3 border-t border-gray-100">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-black font-medium text-sm inline-flex items-center transition-colors duration-200"
              >
                Open Resource <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </div>
          </div>
        );
      } else {
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-black hover:underline flex items-center flex-1 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {getResourceIcon(resource?.type)}
                <span className="ml-2">{resource.name}</span>
                <ExternalLink className="w-3 h-3 ml-1.5" />
              </a>
              <span className="ml-2 text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
                {resource?.type || "Resource"}
              </span>
            </div>
          </div>
        );
      }
    };

    return (
      <div
        className={`mb-6 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100 ${
          locked ? "relative" : ""
        }`}
      >
        {locked && (
          <div className="absolute top-0 right-0 bg-gray-700 text-white py-1 px-3 rounded-bl-lg text-xs font-medium flex items-center z-10">
            <Lock className="w-3 h-3 mr-1" /> Complete previous first
          </div>
        )}

        <div
          className={`p-5 flex items-start justify-between cursor-pointer transition-colors duration-200 ${
            locked ? "opacity-50" : ""
          }`}
          onClick={() => {
            if (!locked) setIsExpanded(!isExpanded);
          }}
        >
          <div className="flex items-start flex-1">
            <div
              className={`mt-1 mr-4 p-1 rounded-full transition-colors duration-200 ${
                isExpanded ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {checkpoint.title}
                </h3>
                <div className="ml-3">
                  {getStatusIcon(checkpoint.status, locked)}
                </div>
              </div>

              <p className="text-gray-600 mt-1 text-sm">
                {checkpoint.description}
              </p>

              <div className="flex flex-wrap gap-3 mt-2 text-xs">
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                  <Clock size={14} />
                  {checkpoint.totalHoursNeeded} hours estimated
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                    checkpoint.status === "completed"
                      ? "bg-green-50 text-green-600"
                      : checkpoint.status === "in_progress"
                      ? "bg-yellow-50 text-yellow-600"
                      : "bg-gray-50 text-gray-600"
                  }`}
                >
                  <Clock size={14} />
                  Time spent: {calculateTimeSpent()}
                </span>

                {checkpoint.status === "completed" && !isFeedbackCompleted && (
                  <button
                    onClick={handleOpenFeedbackModal}
                    className={`ml-2 rounded-lg text-white transition-all duration-300 shadow-md hover:shadow-lg bg-black hover:bg-slate-700 cursor-pointer`}
                    title="Leave Feedback"
                  >
                    <div className="px-2 py-2 flex items-center">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 group-hover:bg-white/30">
                        <Star className="w-4 h-4" />
                      </span>
                      <span className="ml-2 text-white">Leave Feedback</span>
                    </div>
                  </button>
                )}

                {checkpoint.status === "completed" && isFeedbackLoading && (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin mr-1"></div>
                    <span>Loading feedback...</span>
                  </div>
                )}

                {checkpoint.status === "completed" &&
                  isFeedbackCompleted &&
                  !isFeedbackLoading && (
                    <div className="flex items-center text-sm text-gray-600">
                      {feedbackData && feedbackData._id && (
                        <>
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span>
                            You rated this checkpoint {feedbackData.rating}/5
                          </span>
                          <button
                            onClick={handleOpenFeedbackModal}
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            Edit feedback
                          </button>
                        </>
                      )}
                    </div>
                  )}

                {checkpoint.status !== "completed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCheckpointStatus(
                        roadmapId,
                        checkpoint._id,
                        "completed"
                      );
                    }}
                    disabled={locked || checkpoint.status !== "in_progress"}
                    className={`ml-auto rounded-lg text-white group cursor-pointer transition-all duration-300 ${
                      locked || checkpoint.status !== "in_progress"
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : "shadow-md hover:shadow-lg bg-gradient-to-r from-black to-gray-700 hover:from-gray-800 hover:to-black"
                    }`}
                    title="Mark as Completed"
                  >
                    <div className="px-2 py-2 flex items-center">
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-full ${
                          locked || checkpoint.status !== "in_progress"
                            ? "bg-gray-300"
                            : "bg-white/20 group-hover:bg-white/30"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </span>
                      <span className="sr-only">Mark as Completed</span>
                    </div>
                  </button>
                )}

                <div className="mt-4 space-y-3">
                  {checkpoint?.whatNext && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-400">
                      <h4 className="font-medium text-black flex items-center mb-2">
                        <ArrowRight className="w-4 h-4 mr-2" /> What Next:
                      </h4>
                      <p className="text-black text-sm">
                        {checkpoint.whatNext}
                      </p>
                    </div>
                  )}

                  {checkpoint?.whatYouWillLearn && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-400">
                      <h4 className="font-medium text-black flex items-center mb-2">
                        <BookOpen className="w-4 h-4 mr-2" /> What You Will
                        Learn:
                      </h4>
                      <p className="text-black text-sm">
                        {checkpoint.whatYouWillLearn.join(", ")}
                      </p>
                    </div>
                  )}
                </div>

				{checkpoint.status == "completed" && <CheckpointActionButtons topic={checkpoint?.title} />}
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-12 pb-5 pt-2 animate-fadeIn border-t border-gray-100 bg-white">
            <h4 className="text-md font-medium mb-3 text-gray-800 flex items-center">
              <Info className="w-4 h-4 mr-2" /> Resources:
            </h4>
            {checkpoint.resources.length > 0 ? (
              <div className="space-y-1">
                {checkpoint.resources.map((resource) => (
                  <ResourceItem key={resource._id} resource={resource} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No resources available for this checkpoint.
              </p>
            )}

            <CheckpointFeedbackSummary checkpointId={checkpoint._id} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <Toast ref={toast} />

      <div className="w-[80vw] mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-scroll">
        {isLoading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4 animate-pulse">
              <Loader className="w-6 h-6 text-black animate-spin" />
              <p className="text-gray-700 font-medium">Processing...</p>
            </div>
          </div>
        )}

        {showFeedbackModal && selectedCheckpoint && (
          <FeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            checkpointId={selectedCheckpoint._id}
            roadmapId={selectedRoadmap._id}
            checkpointTitle={selectedCheckpoint.title}
            onFeedbackSubmitted={handleFeedbackSubmitted}
          />
        )}

        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          leaderboardData={leaderboardData}
          currentUserId={user?._id}
        />

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Create New Roadmap
              </h2>
              <p className="text-gray-600 mb-4">
                Enter a topic to generate a comprehensive learning roadmap. If a
                roadmap for this topic already exists, you'll join it!
              </p>

              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. JavaScript, Machine Learning, Web Development"
                  className="w-full text-black pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateRoadmap}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-500 transition-colors flex items-center"
                >
                  <Plus className="w-5 h-5 mr-1" /> Generate Roadmap
                </button>
              </div>
            </div>
          </div>
        )}

        {roadmaps.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-blue-50 inline-flex p-4 rounded-full mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No roadmaps found
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first learning roadmap to get started on your learning
              journey.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-slate-500 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              Create Your First Roadmap
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <Bookmark className="w-4 h-4 mr-2" /> Your Roadmaps
                </h2>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                  {roadmaps.map((roadmap) => (
                    <div
                      key={roadmap._id}
                      onClick={() => {
                        setSelectedRoadmap(roadmap);
                        fetchRoadmapInsights(roadmap._id);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-200 ${
                        selectedRoadmap && selectedRoadmap._id === roadmap._id
                          ? "bg-gray-200 border-l-4 border-black"
                          : "bg-gray-50"
                      }`}
                    >
                      <h3 className="font-medium text-gray-800">
                        {roadmap.mainTopic}
                      </h3>
                      <div className="flex items-center mt-2">
                        <div className="w-full bg-gray-300 rounded-full h-2">
                          <div
                            className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${roadmap.totalProgress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {roadmap.totalProgress}%
                        </span>
                      </div>

                      {roadmap.users && roadmap.users.length > 1 && (
                        <div className="mt-2 flex items-center text-xs  text-blue-600 ">
                          <Users className="w-3 h-3 mr-1" />
                          Learning with {roadmap.users.length - 1} others
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-black text-white hover:bg-slate-500 py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-1" /> New Roadmap
              </button>
            </div>

            <div className="lg:col-span-3">
              {selectedRoadmap ? (
                <div className="animate-fadeIn">
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                          {selectedRoadmap.mainTopic}
                        </h1>
                        <p className="text-gray-600">
                          {selectedRoadmap.description}
                        </p>

                        {selectedRoadmap.users &&
                          selectedRoadmap.users.length > 1 && (
                            <div className="mt-3">
                              <button
                                onClick={openLeaderboard}
                                className="flex items-center cursor-pointer text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Learning with {selectedRoadmap.users.length -
                                  1}{" "}
                                others
                                <Trophy className="w-4 h-4 ml-2" />
                              </button>
                            </div>
                          )}
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20">
                          <svg
                            className="w-20 h-20 transform -rotate-90"
                            viewBox="0 0 100 100"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#000"
                              strokeWidth="10"
                              strokeDasharray="283"
                              strokeDashoffset={
                                283 -
                                (283 * selectedRoadmap.totalProgress) / 100
                              }
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-black">
                              {selectedRoadmap.totalProgress}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-center text-gray-600 mt-2">
                          Overall Progress
                        </p>
                      </div>
                    </div>
                  </div>

                  <LeaderboardInsights
                    roadmapInsights={roadmapInsights}
                    leaderboard={leaderboardData}
                    currentUserPosition={currentUserPosition}
                  />

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Award className="w-5 h-5 mr-2" /> Learning Checkpoints
                      </h2>
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center text-sm text-gray-600">
                          <Circle className="w-4 h-4 text-gray-400 mr-1" /> Not
                          Started
                        </span>
                        <span className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-yellow-500 mr-1" /> In
                          Progress
                        </span>
                        <span className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />{" "}
                          Completed
                        </span>
                        <span className="flex items-center text-sm text-gray-600">
                          <Lock className="w-4 h-4 text-gray-500 mr-1" /> Locked
                        </span>
                      </div>
                    </div>
                  </div>

                  {[...selectedRoadmap.checkpoints]
                    .sort((a, b) => a.order - b.order)
                    .map((checkpoint) => (
                      <CheckpointItem
                        key={checkpoint._id}
                        checkpoint={checkpoint}
                        roadmapId={selectedRoadmap._id}
                        checkpoints={selectedRoadmap.checkpoints}
                      />
                    ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Award className="w-16 h-16 text-black mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Select a roadmap
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Choose a roadmap from the sidebar or create a new one to
                    view detailed learning checkpoints.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Roadmap = () => (
  <>
    <StyleTag />
    <RoadmapGenerator />
  </>
);

export default Roadmap;
