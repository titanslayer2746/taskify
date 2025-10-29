import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
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
      // Call the actual register API
      const response = await apiService.register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });

      // Check if the API call was successful
      if (response.success && response.data) {
        // Check if email verification is required
        if (response.data.requiresVerification) {
          // Redirect to OTP verification page
          navigate("/verify-otp", {
            state: {
              email: formData.email,
              otpExpiresIn: response.data.otpExpiresIn,
            },
          });
        } else {
          // Transform the backend response to match frontend expectations
          const authData = {
            user: response.data.user,
            token: response.data.token,
            refreshToken: response.data.refreshToken,
          };

          // Automatically log in the user after successful registration
          await login(authData);

          // Navigate to the original destination or dashboard
          navigate(from);
        }
      } else {
        // Handle API error response
        setErrors({
          general: response.message || "Registration failed. Please try again.",
        });
      }
    } catch (error: unknown) {
      console.error("Sign up error:", error);

      // Handle different types of errors
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 409) {
          setErrors({ general: "An account with this email already exists" });
        } else if (axiosError.response?.status === 400) {
          setErrors({
            general: axiosError.response.data?.message || "Invalid input",
          });
        } else if (
          axiosError.response?.status &&
          axiosError.response.status >= 500
        ) {
          setErrors({ general: "Server error. Please try again later." });
        } else {
          setErrors({ general: "Failed to create account. Please try again." });
        }
      } else if (error && typeof error === "object" && "message" in error) {
        const messageError = error as { message: string };
        if (messageError.message === "Network Error") {
          setErrors({
            general: "Network error. Please check your connection.",
          });
        } else {
          setErrors({ general: "Failed to create account. Please try again." });
        }
      } else {
        setErrors({ general: "Failed to create account. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { y: 20 },
    visible: {
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.98 },
    visible: {
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        delay: 0.1,
      },
    },
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: "bg-gray-600", text: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthMap = {
      1: { color: "bg-red-500", text: "Very Weak" },
      2: { color: "bg-orange-500", text: "Weak" },
      3: { color: "bg-yellow-500", text: "Fair" },
      4: { color: "bg-blue-500", text: "Good" },
      5: { color: "bg-green-500", text: "Strong" },
    };

    return {
      strength,
      ...(strengthMap[strength as keyof typeof strengthMap] || {
        color: "bg-gray-600",
        text: "",
      }),
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <motion.div
        className="flex items-center justify-center p-4 min-h-screen"
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
          {/* Sign Up Card */}
          <motion.div variants={cardVariants}>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 backdrop-blur-sm shadow-2xl rounded-lg">
              <div className="flex flex-col space-y-1 p-3 text-center pb-3">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-2"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-5 h-5 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-lg flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Create Account
                </h3>
                <p className="text-gray-400 text-xs">
                  Join Taskify and start your productivity journey today
                </p>
              </div>

              <div className="p-3 pt-0">
                <form onSubmit={handleSubmit} className="space-y-2">
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

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label
                        htmlFor="firstName"
                        className="text-xs font-medium text-gray-300"
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 ${
                            errors.firstName
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : ""
                          }`}
                        />
                      </div>
                      {errors.firstName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm"
                        >
                          {errors.firstName}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="lastName"
                        className="text-xs font-medium text-gray-300"
                      >
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 ${
                            errors.lastName
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : ""
                          }`}
                        />
                      </div>
                      {errors.lastName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm"
                        >
                          {errors.lastName}
                        </motion.p>
                      )}
                    </div>
                  </div>

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
                        placeholder="john.doe@example.com"
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
                        placeholder="Create a strong password"
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
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-0.5"
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                level <= passwordStrength.strength
                                  ? passwordStrength.color
                                  : "bg-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">
                          Password strength: {passwordStrength.text}
                        </p>
                      </motion.div>
                    )}

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

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <label
                      htmlFor="confirmPassword"
                      className="text-xs font-medium text-gray-300"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 ${
                          errors.confirmPassword
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-0.5">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => setAgreedToTerms(!agreedToTerms)}
                        className={`mt-0.5 w-3 h-3 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          agreedToTerms
                            ? "bg-purple-500 border-purple-500"
                            : "bg-transparent border-gray-600 hover:border-gray-500"
                        }`}
                      >
                        {agreedToTerms && (
                          <CheckCircle className="w-2 h-2 text-white" />
                        )}
                      </button>
                      <div className="flex-1">
                        <label className="text-xs text-gray-300 leading-tight">
                          I agree to the{" "}
                          <Link
                            to="/terms"
                            className="text-purple-400 hover:text-purple-300 underline"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            to="/privacy"
                            className="text-purple-400 hover:text-purple-300 underline"
                          >
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    </div>
                    {errors.terms && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm"
                      >
                        {errors.terms}
                      </motion.p>
                    )}
                  </div>

                  {/* Sign Up Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 hover:from-purple-700 hover:via-blue-700 hover:to-emerald-700 text-white font-medium py-1.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:ring-4 focus:ring-purple-500/50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </motion.div>

                  {/* Sign In Link and Back to Home */}
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <span className="text-gray-400 text-xs">
                        Already have an account?{" "}
                      </span>
                      <Link
                        to="/signin"
                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 text-xs"
                      >
                        Sign in
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
    </div>
  );
};

export default SignUp;
