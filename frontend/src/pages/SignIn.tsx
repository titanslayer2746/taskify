import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  PaperAlert,
  PaperAuthLayout,
  PaperInput,
  PaperPasswordInput,
  PaperSubmit,
} from "@/components/PaperAuth";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
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
        // Check if email verification is required
        if (response.data.requiresVerification) {
          // Redirect to OTP verification page without showing errors
          navigate("/verify-otp", {
            state: {
              email: formData.email,
              otpExpiresIn: response.data.otpExpiresIn,
              fromLogin: true,
            },
          });
        } else {
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
        }
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

  return (
    <PaperAuthLayout
      kicker="Sign in"
      heading={
        <>
          Welcome back.
          <br />
          <span className="italic text-ink-soft">
            Your notebook is where you left it.
          </span>
        </>
      }
      headerPrompt="New here?"
      headerLink={{ to: "/signup", label: "Start a notebook" }}
      formTitle="Sign in"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-7">
        <PaperAlert message={errors.general} />

        <PaperInput
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
        />

        <PaperPasswordInput
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          labelAside={
            <Link
              to="/forgot-password"
              className="paper-focus ink-link text-sm text-ink-soft hover:text-ink"
            >
              Forgot it?
            </Link>
          }
        />

        <PaperSubmit loading={isLoading} loadingLabel="Opening your notebook…">
          Sign in
        </PaperSubmit>

        <p className="text-center text-[15px] text-ink-soft">
          No notebook yet?{" "}
          <Link to="/signup" className="paper-focus ink-link text-ink">
            Start one
          </Link>
        </p>
      </form>
    </PaperAuthLayout>
  );
};

export default SignIn;
