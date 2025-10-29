import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get email from location state or redirect to signup
  const email = location.state?.email;
  const otpExpiresIn = location.state?.otpExpiresIn || 600; // 10 minutes default
  const fromLogin = location.state?.fromLogin || false; // Check if user came from login

  useEffect(() => {
    if (!email) {
      navigate("/signup");
      return;
    }

    // Start countdown timer
    setTimeLeft(otpExpiresIn);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate, otpExpiresIn]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if a digit is entered
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Clear error when user starts typing
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasteData[i] || "";
    }
    
    setOtp(newOtp);
    
    // Focus the last filled input or the 6th input
    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs[focusIndex].current?.focus();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const otpString = otp.join("");

    if (!otpString) {
      newErrors.otp = "OTP is required";
    } else if (otpString.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    const otpString = otp.join("");

    try {
      const response = await apiService.verifyOtp({
        email,
        otp: otpString,
      });

      if (response.success && response.data) {
        setIsVerified(true);

        // Transform the backend response to match frontend expectations
        const authData = {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        };

        // Use the authentication context to handle login
        await login(authData);

        // Show success message briefly before redirecting
        setTimeout(() => {
          navigate("/habits");
        }, 2000);
      } else {
        setErrors({
          general:
            response.message || "OTP verification failed. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);

      if (error.response?.status === 400) {
        setErrors({
          otp: error.response.data?.message || "Invalid OTP. Please try again.",
        });
      } else if (error.response?.status === 429) {
        setErrors({
          general: "Too many failed attempts. Please request a new OTP.",
        });
      } else if (error.response?.status >= 500) {
        setErrors({ general: "Server error. Please try again later." });
      } else if (error.message === "Network Error") {
        setErrors({ general: "Network error. Please check your connection." });
      } else {
        setErrors({ general: "OTP verification failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrors({});

    try {
      const response = await apiService.resendOtp({ email });

      if (response.success) {
        setTimeLeft(response.data.otpExpiresIn);
        setOtp(["", "", "", "", "", ""]);
        setErrors({});
        inputRefs[0].current?.focus();

        // Show success message
        setErrors({
          success: "New OTP sent successfully! Please check your email.",
        });
      } else {
        setErrors({
          general:
            response.message || "Failed to resend OTP. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);

      if (error.response?.status === 429) {
        setErrors({
          general: "Please wait before requesting a new OTP.",
        });
      } else if (error.response?.status >= 500) {
        setErrors({ general: "Server error. Please try again later." });
      } else {
        setErrors({ general: "Failed to resend OTP. Please try again." });
      }
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
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

        <motion.div
          className="flex items-center justify-center p-4 min-h-screen relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative w-full max-w-md">
            <motion.div variants={cardVariants}>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 backdrop-blur-sm shadow-2xl rounded-lg text-center">
                <div className="p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    Email Verified!
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Your email has been successfully verified. Redirecting to
                    dashboard...
                  </p>
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
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

      <motion.div
        className="flex items-center justify-center p-4 min-h-screen relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative w-full max-w-md">
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
                  Verify Your Email
                </h3>
                <p className="text-gray-400 text-sm">
                  {fromLogin
                    ? "Your login credentials are correct! We've sent a verification code to your email."
                    : "We've sent a 6-digit verification code to"}
                  <br />
                  <span className="text-purple-400 font-medium">{email}</span>
                </p>
              </div>

              <div className="p-4 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* General Error/Success */}
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg text-sm ${
                        errors.general.includes("success")
                          ? "bg-green-500/10 border border-green-500/20 text-green-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                      }`}
                    >
                      {errors.general}
                    </motion.div>
                  )}

                  {/* OTP Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-300">
                      Enter Verification Code
                    </label>
                    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          ref={inputRefs[index]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className={`w-12 h-12 text-center text-2xl font-mono bg-gray-800/50 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500/20 ${
                            errors.otp
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : ""
                          }`}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    {errors.otp && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm flex items-center"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.otp}
                      </motion.p>
                    )}
                  </div>

                  {/* Timer and Resend OTP */}
                  <div className="flex items-center justify-between">
                    {timeLeft > 0 && (
                      <p className="text-sm text-gray-400">
                        Code expires in{" "}
                        <span className="font-medium text-purple-400">
                          {formatTime(timeLeft)}
                        </span>
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending || timeLeft > 0}
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isResending || timeLeft > 0
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-purple-400 hover:text-purple-300"
                      }`}
                    >
                      {isResending ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading || otp.join("").length !== 6}
                      className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 hover:from-purple-700 hover:via-blue-700 hover:to-emerald-700 text-white font-medium py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 focus:ring-4 focus:ring-purple-500/50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Email"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
