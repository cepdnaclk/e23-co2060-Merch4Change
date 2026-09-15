import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/Context";
import { getMyCharity } from "../../services/charityApi";
import "./LoginPage.css";
import BrandLogo from "../../components/BrandLogo/BrandLogo";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ===== Two-factor authentication challenge state =====
  // When the API responds to /login with requiresTwoFactor, we hold onto the
  // short-lived twoFactorToken and switch the form into "enter code" mode
  // instead of navigating away.
  const [twoFactorToken, setTwoFactorToken] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const { login } = useAuth();

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostLoginNavigation = async (user) => {
    if (user?.accountType === "organization" && user?.role !== "charity") {
      try {
        const charityRes = await getMyCharity();
        const status = charityRes?.data?.charity?.verificationStatus;
        if (status === "unsubmitted" || status === "rejected") {
          navigate("/charity/verify");
          return;
        }
      } catch (err) {
        console.error("Failed to check charity verification status:", err);
      }
    }
    navigate("/home");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.email.trim() || !formData.password) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${apiBase}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.message || "Invalid credentials provided.");
        return;
      }

      if (data?.data?.requiresTwoFactor) {
        setTwoFactorToken(data.data.twoFactorToken);
        setOtpEmail(data.data.email || formData.email.trim());
        return;
      }

      if (data?.data?.accessToken) {
        login(data.data.accessToken, data.data.user);
        await handlePostLoginNavigation(data.data.user);
      } else {
        setErrorMsg("Login failed — access token missing.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrorMsg("Unable to connect to service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otpCode.trim()) {
      setErrorMsg("Please enter the verification code.");
      return;
    }

    try {
      setIsVerifyingOtp(true);

      const response = await fetch(`${apiBase}/api/v1/auth/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ twoFactorToken, otp: otpCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.message || "Invalid or expired verification code.");
        return;
      }

      if (data?.data?.accessToken) {
        login(data.data.accessToken, data.data.user);
        await handlePostLoginNavigation(data.data.user);
      } else {
        setErrorMsg("Verification failed — access token missing.");
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      setErrorMsg("Unable to connect to service. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg("");
    setResendMsg("");
    try {
      setIsResendingOtp(true);
      const response = await fetch(`${apiBase}/api/v1/auth/resend-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ twoFactorToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.message || "Could not resend the code.");
        return;
      }

      if (data?.data?.twoFactorToken) {
        setTwoFactorToken(data.data.twoFactorToken);
      }
      setResendMsg("A new code has been sent to your email.");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setErrorMsg("Unable to connect to service. Please try again.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleBackToLogin = () => {
    setTwoFactorToken(null);
    setOtpCode("");
    setOtpEmail("");
    setErrorMsg("");
    setResendMsg("");
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <Link to="/" className="login-brand">
          <BrandLogo size={36} className="login-brand-icon" />
          <span className="login-brand-name">Merch4Change</span>
        </Link>

        <div className="login-hero">
          <h1 className="login-tagline">
            Wear your<br />
            <em>values</em> on<br />
            your sleeve.
          </h1>
          <p className="login-desc">
            Connect with causes, creators, and communities that matter — through merchandise that makes a difference.
          </p>
        </div>

        <div className="login-testimonial-wrap">
          <div className="login-testimonial">
            <p className="login-testimonial-text">
              "Merch4Change helped us raise over $12,000 for our local shelter — and the products practically sold themselves."
            </p>
            <div className="login-testimonial-author">
              <div className="login-avatar">SR</div>
              <div>
                <div className="login-author-name">Sarah R.</div>
                <div className="login-author-role">NGO Founder, Colombo</div>
              </div>
            </div>
          </div>
          <div className="login-dots">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="login-dot" />
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          {!twoFactorToken ? (
            <>
              <p className="login-eyebrow">Welcome back</p>
              <h2 className="login-title">Sign in to your account</h2>
              <p className="login-subtitle">
                Don't have an account?{" "}
                <Link to="/signup" className="login-link">Sign up free</Link>
              </p>

              {errorMsg && <div className="login-error" role="alert">{errorMsg}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="login-field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="password">Password</label>
                  <div className="login-password-wrapper">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div className="login-options-row">
                  <label className="login-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="login-forgot">
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" className="login-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <p className="login-terms">
                By signing in you agree to our{" "}
                <Link to="/terms" className="login-link">Terms</Link>{" "}&amp;{" "}
                <Link to="/privacy" className="login-link">Privacy Policy</Link>
              </p>
            </>
          ) : (
            <>
              <p className="login-eyebrow">Two-factor authentication</p>
              <h2 className="login-title">Enter your verification code</h2>
              <p className="login-subtitle">
                We sent a 6-digit code to <strong>{otpEmail}</strong>. It expires in a few minutes.
              </p>

              {errorMsg && <div className="login-error" role="alert">{errorMsg}</div>}
              {resendMsg && !errorMsg && (
                <div className="login-error" role="status" style={{ background: "#e6f4ea", color: "#1e7e34" }}>
                  {resendMsg}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="login-field">
                  <label htmlFor="otp">Verification code</label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                  />
                </div>

                <button type="submit" className="login-btn" disabled={isVerifyingOtp}>
                  {isVerifyingOtp ? "Verifying…" : "Verify & sign in"}
                </button>
              </form>

              <div className="login-options-row" style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="login-link"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  onClick={handleResendOtp}
                  disabled={isResendingOtp}
                >
                  {isResendingOtp ? "Resending…" : "Resend code"}
                </button>
                <button
                  type="button"
                  className="login-link"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  onClick={handleBackToLogin}
                >
                  Back to login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;