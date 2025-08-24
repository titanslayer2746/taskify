import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the return URL from location state, default to /habits
  const from = location.state?.from?.pathname || "/habits";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Call the actual login API
      const response = await apiService.login({
        email: formData.email,
        password: formData.password,
      });

      // Check if the API call was successful
      if (response.success && response.data) {
        // Transform the backend response to match frontend expectations
        const authData = {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        };

        // Use the authentication context to handle login
        await login(authData);

        // Navigate to the original destination or dashboard
        navigate(from);
      } else {
        // Handle API error response
        setErrors({
          general: response.message || "Login failed. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Sign in error:", error);

      // Handle different types of errors
      if (error.response?.status === 401) {
        setErrors({ general: "Invalid email or password" });
      } else if (error.response?.status === 400) {
        setErrors({ general: error.response.data?.message || "Invalid input" });
      } else if (error.response?.status >= 500) {
        setErrors({ general: "Server error. Please try again later." });
      } else if (error.message === "Network Error") {
        setErrors({ general: "Network error. Please check your connection." });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"
        animate={{
          y: [10, -10, 10],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Sign In Card */}
        <motion.div variants={cardVariants}>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 backdrop-blur-sm shadow-2xl rounded-lg">
            <div className="flex flex-col space-y-1.5 p-4 text-center pb-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <Mail className="w-3 h-3 text-white" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Welcome Back
              </h3>
              <p className="text-gray-400 text-sm">
                Sign in to your account to continue your productivity journey
              </p>
            </div>

            <div className="p-4 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* General Error */}
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                  >
                    {errors.general}
                  </motion.div>
                )}

                {/* Email Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium text-gray-300"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : ""
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-gray-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 hover:from-purple-700 hover:via-blue-700 hover:to-emerald-700 text-white font-medium py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:ring-4 focus:ring-purple-500/50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>

                {/* Sign Up Link and Back to Home */}
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <span className="text-gray-400 text-xs">
                      Don't have an account?{" "}
                    </span>
                    <Link
                      to="/signup"
                      className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 text-xs"
                    >
                      Sign up
                    </Link>
                  </div>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-white text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Home
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SignIn;
