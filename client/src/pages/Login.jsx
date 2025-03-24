import React, { useState, useRef } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, X } from "lucide-react";
import { Toast } from "primereact/toast";
import homeVector from "../assets/home.jpg";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthContext from "../hooks/useAuthContext";
import StreakPopup from "../components/StreakPopup";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal states
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // Reset password modal states
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const navigate = useNavigate();

  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    maxStreak: 0,
  });

  const { state, dispatch } = useAuthContext();

  const toast = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: data.message,
        });

        const lastLogin = new Date(data.data.lastLoginDate);
        const lastLoginDay = new Date(
          lastLogin.getFullYear(),
          lastLogin.getMonth(),
          lastLogin.getDate()
        );

        console.log(data.data.shouldShowStreakPopup);

        // Check if we should show the streak popup based on the flag from backend
        if (data.data.shouldShowStreakPopup && data.data.currentStreak >= 1) {
          setStreakData({
            currentStreak: data.data.currentStreak,
            maxStreak: data.data.maxStreak,
          });
          setShowStreakPopup(true);

          // Navigate after popup timeout
          setTimeout(() => {
            dispatch({
              type: "LOGIN_SUCCESS",
              payload: { user: data.data, token: data.token },
            });
            if (data.data.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/");
            }
          }, 2000);
        } else {
          // No popup needed, just navigate directly
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user: data.data, token: data.token },
          });
          if (data.data.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: data.message,
        });
      }
      setIsLoading(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred. Please try again later.",
      });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      setForgotPasswordLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotPasswordEmail,
          }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Reset instructions sent to your email",
        });
        setShowForgotPasswordModal(false);
        setResetEmail(forgotPasswordEmail);
        setShowResetPasswordModal(true);
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Failed to process request",
        });
      }
      setForgotPasswordLoading(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred. Please try again later.",
      });
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setResetPasswordLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: resetEmail,
            token: resetToken,
            password: newPassword,
          }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Password reset successfully",
        });
        setShowResetPasswordModal(false);
        setEmail(resetEmail); // Pre-fill the login email field
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Failed to reset password",
        });
      }
      setResetPasswordLoading(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred. Please try again later.",
      });
      setResetPasswordLoading(false);
    }
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: -50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 500 },
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  // Function to handle token input - only allow 6 alphanumeric characters and auto-capitalize
  const handleTokenChange = (e) => {
    const value = e.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 6)
      .toUpperCase();
    setResetToken(value);
  };

  // Handle backdrop click to close modals
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (showForgotPasswordModal) setShowForgotPasswordModal(false);
      if (showResetPasswordModal) setShowResetPasswordModal(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Toast ref={toast} />

      {/* Left Section - Introduction */}
      <div className="hidden lg:flex lg:w-1/2 bg-white flex-col justify-center items-center p-10">
        <div className="max-w-md text-center">
          <h1 className="text-5xl font-bold mb-6 text-black">AdaptEd</h1>
          <p className="text-xl font-light mb-8 text-gray-800">
            A community-driven personalized learning platform
          </p>
          <div className="flex justify-center mb-8">
            <img src={homeVector} alt="Home Vector" className="w-96" />
          </div>
          <p className="text-lg mb-10 text-gray-800">
            Join our community to access a wealth of knowledge and personalized
            learning experiences.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6 bg-black">
        <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-3">
              Sign in to your account
            </h2>
            <p className="text-gray-800">Enter your credentials to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-3 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-800"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-black hover:text-gray-600 font-medium"
                  onClick={() => {
                    setShowForgotPasswordModal(true);
                    setForgotPasswordEmail(email);
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full flex justify-center items-center py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </button>
            <div className="text-center mt-6">
              <p className="text-gray-800">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-black hover:text-gray-600 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal with AnimatePresence */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={handleBackdropClick}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                className="absolute top-4 right-4"
                onClick={() => setShowForgotPasswordModal(false)}
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              <h3 className="text-xl font-bold text-black mb-4">
                Reset your password
              </h3>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you instructions to
                reset your password.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="forgotPasswordEmail"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <input
                      id="forgotPasswordEmail"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-3 py-3 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full flex justify-center items-center py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out ${
                    forgotPasswordLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-black"
                    onClick={() => setShowForgotPasswordModal(false)}
                  >
                    Back to login
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal with AnimatePresence */}
      <AnimatePresence>
        {showResetPasswordModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={handleBackdropClick}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                className="absolute top-4 right-4"
                onClick={() => setShowResetPasswordModal(false)}
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              <h3 className="text-xl font-bold text-black mb-4">
                Set new password
              </h3>
              <p className="text-gray-600 mb-6">
                Enter the 6-digit alphanumeric token from your email and create
                a new password.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="resetEmail"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-3 py-3 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="resetToken"
                    className="block text-sm font-medium text-gray-800"
                  >
                    Reset Token (6 characters)
                  </label>
                  <div className="flex justify-center">
                    <input
                      id="resetToken"
                      type="text"
                      value={resetToken}
                      onChange={handleTokenChange}
                      placeholder="Enter 6-digit token"
                      className="w-full px-3 py-3 text-center text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black tracking-wider font-medium text-lg"
                      maxLength={6}
                      required
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6 character alphanumeric token sent to your email
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-800"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-600" />
                    </div>
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create new password"
                      className="w-full pl-10 pr-10 py-3 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full flex justify-center items-center py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out ${
                    resetPasswordLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  disabled={resetPasswordLoading}
                >
                  {resetPasswordLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-black"
                    onClick={() => setShowResetPasswordModal(false)}
                  >
                    Back to login
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StreakPopup
        streak={streakData.currentStreak}
        isVisible={showStreakPopup}
        onClose={() => setShowStreakPopup(false)}
      />
    </div>
  );
};

export default Login;
