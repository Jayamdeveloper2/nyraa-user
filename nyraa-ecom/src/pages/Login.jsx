import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, LogIn, Eye, EyeOff } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      setOtpSent(true);
      setIsLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!otp) {
      setError("Please enter the OTP");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      setOtpVerified(true);
      setIsLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to verify OTP");
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data.user));
      localStorage.setItem("isLoggedIn", "true");

      navigate("/account/profile");
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred during login");
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/google', {
        token: credentialResponse.credential
      });

      console.log('Google login response:', response.data); 

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data.user));
      localStorage.setItem("isLoggedIn", "true");

      navigate("/account/profile");
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.response?.data?.message || "Google login failed");
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    setError("Google login failed. Please try again.");
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: forgotEmail
      });
      setForgotSuccess(response.data.message);
      setIsLoading(false);
    } catch (error) {
      setForgotError(error.response?.data?.message || "Failed to send reset email");
      setIsLoading(false);
    }
  };

  useEffect(() => {
  // Clear any existing auth data when component mounts
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  localStorage.removeItem("isLoggedIn");
}, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="login-container py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col col-lg-5 col-md-8 col-sm-10">
              <div className="card border-0 shadow-lg rounded-3 login-card">
                <div className="card-header text-center py-4 border-0 rounded-top">
                  <div className="user-icon-container">
                    <User size={28} />
                  </div>
                  <h2 className="fw-bold mb-0">Welcome Back</h2>
                  <p className="text-white-50 mt-2 mb-0">Sign in to your account</p>
                </div>

                <div className="card-body p-4 p-lg-5">
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <div className="me-2">⚠️</div>
                      <div>{error}</div>
                    </div>
                  )}

                  {!forgotPassword ? (
                    <>
                      {!otpSent ? (
                        <form onSubmit={handleSendOtp}>
                          <div className="mb-4">
                            <label htmlFor="email" className="form-label fw-medium">
                              Email Address
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <Mail size={18} className="text-muted" />
                              </span>
                              <input
                                type="email"
                                className="form-control border-start-0 ps-0"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            ) : (
                              <Mail size={18} className="me-2" />
                            )}
                            {isLoading ? "Sending OTP..." : "Send OTP"}
                          </button>

                          <div className="text-center mt-4">
                            <a
                              href="#"
                              className="text-decoration-none small text-primary"
                              onClick={() => setForgotPassword(true)}
                            >
                              Forgot Password?
                            </a>
                          </div>
                        </form>
                      ) : !otpVerified ? (
                        <form onSubmit={handleVerifyOtp}>
                          <div className="mb-4">
                            <label htmlFor="otp" className="form-label fw-medium">
                              Enter OTP
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <Mail size={18} className="text-muted" />
                              </span>
                              <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                id="otp"
                                placeholder="Enter the 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-text mt-1">
                              Enter the OTP sent to {email}.
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            ) : (
                              <LogIn size={18} className="me-2" />
                            )}
                            {isLoading ? "Verifying..." : "Verify OTP"}
                          </button>

                          <div className="text-center mt-4">
                            <a
                              href="#"
                              className="text-decoration-none small text-primary"
                              onClick={() => {
                                setOtpSent(false);
                                setOtp("");
                              }}
                            >
                              Back to Email
                            </a>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleLoginSubmit}>
                          <div className="mb-4">
                            <label htmlFor="email" className="form-label fw-medium">
                              Email Address
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0">
                                <Mail size={18} className="text-muted" />
                              </span>
                              <input
                                type="email"
                                className="form-control border-start-0 ps-0"
                                id="email"
                                value={email}
                                disabled
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                              <label htmlFor="password" className="form-label fw-medium mb-0">
                                Password
                              </label>
                              <a
                                href="#"
                                className="text-decoration-none small text-primary"
                                onClick={() => setForgotPassword(true)}
                              >
                                Forgot Password?
                              </a>
                            </div>
                            <div className="input-group mt-1">
                              <span className="input-group-text bg-light border-end-0">
                                <Lock size={18} className="text-muted" />
                              </span>
                              <input
                                type={showPassword ? "text" : "password"}
                                className="form-control border-start-0 ps-0"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                              />
                              <span
                                className="input-group-text bg-light border-start-0"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: "pointer" }}
                              >
                                {showPassword ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-muted" />}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="rememberMe"
                              />
                              <label className="form-check-label" htmlFor="rememberMe">
                                Remember me
                              </label>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            ) : (
                              <LogIn size={18} className="me-2" />
                            )}
                            {isLoading ? "Signing In..." : "Sign In"}
                          </button>
                        </form>
                      )}

                      <div className="or-divider">Or</div>

                      <div className="text-center mt-4">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={handleGoogleError}
                          render={(renderProps) => (
                            <button
                              onClick={renderProps.onClick}
                              disabled={renderProps.disabled}
                              className="google-login-btn"
                            >
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                                alt="Google logo"
                                className="google-icon"
                              />
                              Sign in with Google
                            </button>
                          )}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {forgotError && (
                        <div className="alert alert-danger d-flex align-items-center" role="alert">
                          <div className="me-2">⚠️</div>
                          <div>{forgotError}</div>
                        </div>
                      )}
                      {forgotSuccess && (
                        <div className="alert alert-success d-flex align-items-center" role="alert">
                          <div className="me-2">✅</div>
                          <div>{forgotSuccess}</div>
                        </div>
                      )}
                      <form onSubmit={handleForgotPasswordSubmit}>
                        <div className="mb-4">
                          <label htmlFor="forgotEmail" className="form-label fw-medium">
                            Email Address
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <Mail size={18} className="text-muted" />
                            </span>
                            <input
                              type="email"
                              className="form-control border-start-0 ps-0"
                              id="forgotEmail"
                              placeholder="Enter your email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-text mt-1">
                            Enter your email to receive a password reset link.
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          ) : (
                            <Mail size={18} className="me-2" />
                          )}
                          {isLoading ? "Sending..." : "Send Reset Link"}
                        </button>

                        <div className="text-center mt-4">
                          <a
                            href="#"
                            className="text-decoration-none small text-primary"
                            onClick={() => setForgotPassword(false)}
                          >
                            Back to Login
                          </a>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;