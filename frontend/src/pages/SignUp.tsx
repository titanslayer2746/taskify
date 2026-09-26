import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  PaperAlert,
  PaperAuthLayout,
  PaperError,
  PaperInput,
  PaperPasswordInput,
  PaperSubmit,
} from "@/components/PaperAuth";
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

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: "bg-ink/10", text: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthMap = {
      1: { color: "bg-clay", text: "Very weak" },
      2: { color: "bg-clay", text: "Weak" },
      3: { color: "bg-ink/40", text: "Fair" },
      4: { color: "bg-ink/70", text: "Good" },
      5: { color: "bg-ink", text: "Strong" },
    };

    return {
      strength,
      ...(strengthMap[strength as keyof typeof strengthMap] || {
        color: "bg-ink/10",
        text: "",
      }),
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <PaperAuthLayout
      kicker="Sign up"
      heading={
        <>
          Start a notebook.
          <br />
          <span className="italic text-ink-soft">Page one is waiting.</span>
        </>
      }
      headerPrompt="Already have one?"
      headerLink={{ to: "/signin", label: "Sign in" }}
      formTitle="New notebook"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-7">
        <PaperAlert message={errors.general} />

        <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
          <PaperInput
            name="firstName"
            label="First name"
            type="text"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
          />
          <PaperInput
            name="lastName"
            label="Last name"
            type="text"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
          />
        </div>

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
        >
          {formData.password && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <span
                    key={level}
                    className={`h-[3px] flex-1 transition-colors duration-300 ${
                      level <= passwordStrength.strength
                        ? passwordStrength.color
                        : "bg-ink/10"
                    }`}
                  />
                ))}
              </div>
              <span className="w-16 text-right font-ledger text-[11px] text-ink-soft">
                {passwordStrength.text}
              </span>
            </div>
          )}
        </PaperPasswordInput>

        <PaperPasswordInput
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug text-ink-soft">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
              }}
              aria-invalid={!!errors.terms}
              aria-describedby={errors.terms ? "terms-error" : undefined}
              className="paper-focus peer sr-only"
            />
            <span
              aria-hidden="true"
              className={`mt-[3px] grid h-4 w-4 shrink-0 place-items-center border transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay ${
                agreedToTerms
                  ? "border-ink bg-ink"
                  : errors.terms
                  ? "border-clay"
                  : "border-ink/50"
              }`}
            >
              {agreedToTerms && (
                <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-paper">
                  <path
                    d="M1.5 5.5l2.2 2.2L8.5 2.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              )}
            </span>
            <span>
              I agree to the{" "}
              <Link to="/terms" className="paper-focus ink-link text-ink">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="paper-focus ink-link text-ink">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <PaperError id="terms-error" message={errors.terms} />
        </div>

        <PaperSubmit loading={isLoading} loadingLabel="Binding your notebook…">
          Start my notebook
        </PaperSubmit>

        <p className="text-center text-[15px] text-ink-soft">
          Already have one?{" "}
          <Link to="/signin" className="paper-focus ink-link text-ink">
            Sign in
          </Link>
        </p>
      </form>
    </PaperAuthLayout>
  );
};

export default SignUp;
