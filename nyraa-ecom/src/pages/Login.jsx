import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { User, Mail, LogIn, AlertCircle, CheckCircle } from "lucide-react"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import axios from "axios"
import "../styles/Login.css"

const Login = () => {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpOption, setShowOtpOption] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    clearMessages()
    setIsLoading(true)

    if (!email) {
      setError("Please enter your email")
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/send-otp", {
        email: email.toLowerCase().trim(),
      })

      if (response.data.success) {
        setOtpSent(true)
        setSuccess("OTP sent to your email successfully!")
        setCountdown(60)
      }
    } catch (error) {
      console.error("Send OTP error:", error)
      setError(error.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    clearMessages()
    setIsLoading(true)

    if (!otp) {
      setError("Please enter the OTP")
      setIsLoading(false)
      return
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
      })

      if (response.data.success) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("userData", JSON.stringify(response.data.user))
        localStorage.setItem("isLoggedIn", "true")

        if (!response.data.user.name || !response.data.user.phone) {
          setSuccess("Login successful! Please complete your profile...")
          setTimeout(() => navigate("/account/profile?complete=true"), 1500)
        } else {
          setSuccess("Login successful! Redirecting...")
          setTimeout(() => navigate("/"), 1500)
        }
      }
    } catch (error) {
      console.error("Verify OTP error:", error)
      setError(error.response?.data?.message || "Failed to verify OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      clearMessages()
      setIsLoading(true)

      const response = await axios.post("http://localhost:5000/api/auth/google", {
        token: credentialResponse.credential,
      })

      if (response.data.success) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("userData", JSON.stringify(response.data.user))
        localStorage.setItem("isLoggedIn", "true")

        setSuccess("Google login successful! Redirecting...")

        if (response.data.isNewUser || !response.data.user.name || !response.data.user.phone) {
          setTimeout(() => navigate("/account/profile?complete=true"), 1500)
        } else {
          setTimeout(() => navigate("/"), 1500)
        }
      }
    } catch (error) {
      console.error("Google login error:", error)
      setError(error.response?.data?.message || "Google login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    console.error("Google login failed")
    setError("Google login failed. Please try again.")
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return

    clearMessages()
    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:5000/api/auth/send-otp", {
        email: email.toLowerCase().trim(),
      })

      if (response.data.success) {
        setSuccess("New OTP sent to your email!")
        setCountdown(60)
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleLoginMethod = () => {
    setShowOtpOption(!showOtpOption)
    clearMessages()
    setOtpSent(false)
    setOtp("")
    setEmail("")
  }

  useEffect(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    localStorage.removeItem("isLoggedIn")
  }, [])

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="user-icon-container">
              <User size={32} />
            </div>
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          <div className="login-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                <AlertCircle size={18} className="me-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" role="alert">
                <CheckCircle size={18} className="me-2" />
                {success}
              </div>
            )}

            {!showOtpOption && (
              <div className="google-login-section">
                <GoogleLogin
                theme="filled_blue"
                shape="pill"
                size="large"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled || isLoading}
                      className="google-signin-btn"
                    >
                      <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        className="google-logo"
                      />
                      Sign in with Google
                    </button>
                  )}
                />

                <div className="or-divider">
                  <span className="or-text">OR</span>
                </div>

                <button className="switch-method-btn" onClick={toggleLoginMethod} type="button">
                  Continue with Email
                </button>
              </div>
            )}

            {showOtpOption && (
              <div className="otp-login-section">
                <button className="back-to-google-btn" onClick={toggleLoginMethod} type="button">
                  ← Back to Google Sign-in
                </button>

                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="otp-form">
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-text">We'll send you an OTP to verify your email</div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Mail size={18} className="me-2" />
                          Send OTP
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="otp-form">
                    <div className="form-group">
                      <label htmlFor="otp" className="form-label">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        className="form-control otp-input"
                        id="otp"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength="6"
                        required
                      />
                      <div className="form-text">Enter the OTP sent to {email}</div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <LogIn size={18} className="me-2" />
                          Verify OTP
                        </>
                      )}
                    </button>

                    <div className="resend-section">
                      {countdown > 0 ? (
                        <span className="resend-timer">Resend OTP in {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          className="resend-btn"
                          onClick={handleResendOtp}
                          disabled={isLoading}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="back-to-email-btn"
                      onClick={() => {
                        setOtpSent(false)
                        setOtp("")
                        clearMessages()
                      }}
                    >
                      Back to Email
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export default Login