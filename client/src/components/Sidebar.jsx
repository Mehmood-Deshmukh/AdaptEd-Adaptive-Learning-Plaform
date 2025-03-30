import {
  BookOpen,
  Crown,
  Flame,
  Home,
  LogOut,
  Map,
  User,
  Users,
  Code,
  BookMarked,
  Menu,
  X,
  HeartHandshake,
  Lock,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  X as CloseIcon,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import useAuthContext from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ user }) => {
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Only show the guide if user hasn't completed the guide
  useEffect(() => {
    if (user && user.isGuideComplete === false) {
      setShowGuide(true);
    }
  }, [user]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleLogout = () => {
    dispatch({ type: "LOADING" });
    dispatch({ type: "LOGOUT" });
  };

  const avatarUsername = encodeURIComponent(user.name);
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${avatarUsername}`;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Guide steps data - now focused only on navigation sections
  const guideSteps = [
    {
      selector: ".dashboard-link",
      title: "Dashboard",
      content:
        "The Dashboard shows an overview of your learning journey and current activities.",
      position: "right",
    },
    {
      selector: ".challenges-link",
      title: "Challenges",
      content:
        "Access various coding challenges to test and improve your skills.",
      position: "right",
    },
    {
      selector: ".roadmap-link",
      title: "Roadmap Generator",
      content:
        "Generate personalized learning roadmaps based on your goals and current skill level.",
      position: "right",
    },
    {
      selector: ".forum-link",
      title: "Forum",
      content:
        "Join discussions with other learners. This feature unlocks when you reach 2000 XP.",
      position: "right",
    },
    {
      selector: ".projects-link",
      title: "Project Tutorials",
      content:
        "Access guided project tutorials to build real applications. Unlocks at 3000 XP.",
      position: "right",
    },
    {
      selector: ".contribute-link",
      title: "Contribute",
      content:
        "Contribute to the platform by creating content or mentoring others. Unlocks at 6000 XP.",
      position: "right",
    },
    {
      selector: ".profile-link",
      title: "Profile",
      content:
        "View and edit your profile settings, achievements, and learning history.",
      position: "right",
    },
  ];

  // Navigation controls for guide
  const nextStep = useCallback(() => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishGuide();
    }
  }, [currentStep, guideSteps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const finishGuide = useCallback(async () => {
    try {
      setShowGuide(false);

      // Update user's isGuideComplete field
      const updatedUser = {
        ...user,
        isGuideComplete: true,
      };

      // Dispatch UPDATE_USER action
      dispatch({
        type: "UPDATE_USER",
        payload: updatedUser,
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/update-guide-status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "UPDATE_USER", payload: data.data });
      }
    } catch (error) {
      console.error(error);
    }
  }, [user, dispatch]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showGuide) return;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          nextStep();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          prevStep();
          break;
        case "Escape":
          finishGuide();
          break;
        default:
          break;
      }
    };

    // Add click anywhere to advance
    const handleClickAnywhere = () => {
      if (showGuide) {
        nextStep();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickAnywhere);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickAnywhere);
    };
  }, [showGuide, nextStep, prevStep, finishGuide]);

  const Guide = () => {
    if (!showGuide) return null;

    const step = guideSteps[currentStep];
    const targetElement = document.querySelector(step.selector);

    if (!targetElement) return null;

    const rect = targetElement.getBoundingClientRect();

    // Calculate position for tooltip
    let tooltipStyle = {};

    switch (step.position) {
      case "right":
        tooltipStyle = {
          left: `${rect.right + 10}px`,
          top: `${rect.top + rect.height / 2 - 50}px`,
        };
        break;
      case "left":
        tooltipStyle = {
          right: `calc(100% - ${rect.left - 10}px)`,
          top: `${rect.top + rect.height / 2 - 50}px`,
        };
        break;
      case "top":
        tooltipStyle = {
          bottom: `calc(100% - ${rect.top - 10}px)`,
          left: `${rect.left + rect.width / 2 - 125}px`,
        };
        break;
      case "bottom":
      default:
        tooltipStyle = {
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2 - 125}px`,
        };
    }

    // Stop event propagation for tooltip clicks
    const handleTooltipClick = (e) => {
      e.stopPropagation();
    };

    return (
      <>
        {/* Highlight overlay for current element */}
        <div
          style={{
            position: "fixed",
            top: `${rect.top - 4}px`,
            left: `${rect.left - 4}px`,
            width: `${rect.width + 8}px`,
            height: `${rect.height + 8}px`,
            border: "2px solid #6366f1",
            borderRadius: "4px",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        />

        {/* Tooltip */}
        <div
          style={{
            ...tooltipStyle,
            position: "fixed",
            width: "250px",
            backgroundColor: "#333",
            color: "#fff",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            zIndex: 1001,
          }}
          onClick={handleTooltipClick}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">{step.title}</h3>
            <button onClick={finishGuide} className="p-1">
              <CloseIcon size={16} />
            </button>
          </div>
          <p className="text-sm mb-3">{step.content}</p>
        </div>
      </>
    );
  };

  const NavItem = ({ icon, text, path, locked, className }) => (
    <div className={`mb-1 ${className || ""}`}>
      <div
        onClick={() => {
          if (!locked) {
            navigate(path);
            if (isMobile) setIsOpen(false);
          }
        }}
        className={`flex items-center px-4 py-3 rounded transition-colors cursor-pointer ${
          locked ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
        }`}
      >
        {React.cloneElement(icon, { size: 18, className: "mr-3" })}
        {(isOpen || !isMobile) && (
          <>
            <span>{text}</span>
            {locked && (
              <span className="text-xs text-red-400 ml-2 flex items-center">
                <Lock size={12} className="mr-1" /> Locked
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );

  const SidebarToggle = () => (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 p-2 bg-black rounded-md text-white"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  return (
    <>
      {/* Render the guide */}
      <Guide />

      {isMobile && <SidebarToggle />}

      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transform md:translate-x-0 transition-transform duration-300 fixed md:static top-0 left-0 z-40 h-full bg-black text-white shadow-lg flex flex-col ${
          isMobile ? "w-full" : "w-64"
        } `}
      >
        <div className="p-5 border-b border-gray-800 flex justify-between items-center logo-section">
          <h2 className={`text-xl font-bold ${isMobile ? "ml-auto" : ""}`}>
            AdaptEd
          </h2>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
            title="Show sidebar guide"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="p-5 border-b border-gray-800 user-profile-section">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-gray-700 flex items-center justify-center">
              <img
                src={avatarUrl}
                alt={`${user.name}'s avatar`}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                loading="lazy"
              />
            </div>
            <div className="ml-3">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.level}</p>
            </div>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <div className="flex items-center streak-section">
              <Flame size={16} className="mr-1" />
              <span>{user.currentStreak} days</span>
            </div>
            <div className="flex items-center xp-section">
              <Crown size={16} className="mr-1" />
              <span>{user?.xps} XP</span>
            </div>
          </div>
          <div className="mt-2 progress-bar-section">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full"
                style={{ width: `${(user.xps % 1000) / 10}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto navigation-section">
          <div className="p-4">
            <NavItem
              icon={<Home />}
              text="Dashboard"
              path="/"
              className="dashboard-link"
            />
            <NavItem
              icon={<BookMarked />}
              text="Challenges"
              path="/challenge-selection"
              className="challenges-link"
            />
            <NavItem
              icon={<Map />}
              text="Generate Roadmap"
              path="/roadmap-generator"
              className="roadmap-link"
            />
            <NavItem
              icon={<Users />}
              text="Forum"
              path="/forum"
              locked={user.xps < 2000}
              className="forum-link"
            />
            <NavItem
              icon={<Code />}
              text="Project Tutorials"
              path="/projects"
              locked={user.xps < 3000}
              className="projects-link"
            />
            <NavItem
              icon={<HeartHandshake />}
              text="Contribute"
              path="/contribute"
              locked={user.xps < 6000}
              className="contribute-link"
            />
            <NavItem
              icon={<User />}
              text="Profile"
              path="/profile"
              className="profile-link"
            />
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800 logout-section">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <LogOut size={18} className="mr-3" />
            {(isOpen || !isMobile) && <span>Logout</span>}
          </button>
        </div>
      </div>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
