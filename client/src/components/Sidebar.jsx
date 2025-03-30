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
  Lock
} from "lucide-react";
import React, { useState, useEffect } from "react";
import useAuthContext from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ user }) => {
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
      const checkScreenSize = () => {
          setIsMobile(window.innerWidth < 768);
          setIsOpen(window.innerWidth >= 768);
      };
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
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

  const NavItem = ({ icon, text, path, locked }) => (
      <div className="mb-1">
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
                      {locked && <span className="text-xs text-red-400 ml-2 flex items-center"><Lock size={12} className="mr-1" /> Locked</span>}
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
          {isMobile && <SidebarToggle />}

          <div 
              className={`${
                  isOpen ? "translate-x-0" : "-translate-x-full"
              } transform md:translate-x-0 transition-transform duration-300 fixed md:static top-0 left-0 z-40 h-full bg-black text-white shadow-lg flex flex-col ${
                  isMobile ? "w-full" : "w-64"
              } `}
          >
              <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                  <h2 className={`text-xl font-bold ${isMobile ? "ml-auto" : ""}`}>AdaptEd</h2>
              </div>

              {/* User info */}
              <div className="p-5 border-b border-gray-800">
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
                      <div className="flex items-center">
                          <Flame size={16} className="mr-1" />
                          <span>{user.currentStreak} days</span>
                      </div>
                      <div className="flex items-center">
                          <Crown size={16} className="mr-1" />
                          <span>{user?.xps} XP</span>
                      </div>
                  </div>
                  <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                              className="bg-white h-1.5 rounded-full"
                              style={{ width: `${(user.xps % 1000) / 10}%` }}
                          ></div>
                      </div>
                  </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                      <NavItem icon={<Home />} text="Dashboard" path="/" />
                      <NavItem icon={<BookMarked />} text="Challenges" path="/challenge-selection" />
                      <NavItem icon={<Map />} text="Generate Roadmap" path="/roadmap-generator" />
                      <NavItem
                          icon={<Users />}
                          text="Forum"
                          path="/forum"
                          locked={user.xps < 2000}
                      />
                      <NavItem
                          icon={<Code />}
                          text="Project Tutorials"
                          path="/projects"
                          locked={user.xps < 3000}
                      />
                      <NavItem
                          icon={<HeartHandshake />}
                          text="Contribute"
                          path="/contribute"
                          locked={user.xps < 6000}
                      />
                      <NavItem icon={<User />} text="Profile" path="/profile" />
                  </div>
              </div>

              {/* Logout */}
              <div className="p-4 border-t border-gray-800">
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
