import React, { useState } from "react";
import "./InputForm.css";
import axios from "axios";
import { toast } from "react-toastify";

function InputForm({ setIsOpen, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setSignUp] = useState(false);
  const [error, setError] = useState("");
  
  // New states for OTP flow
  const [step, setStep] = useState("form"); // "form" or "otp"
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp && step === "form") {
      // Step 1: Send OTP for signup
      try {
        setLoading(true);
        await axios.post("http://localhost:5000/otp-verification/send-otp", { email });
        toast.info("OTP sent to your email!");
        setOtpSent(true);
        setStep("otp");
      } catch (err) {
        const msg = err.response?.data?.error || "Failed to send OTP";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    } 
    else if (isSignUp && step === "otp") {
      // Step 2: Verify OTP and create account
      try {
        setLoading(true);
        await axios.post("http://localhost:5000/otp-verification/verify-otp", { email,otp });
        toast.success("OTP verified! Creating your account...");

        const res = await axios.post("http://localhost:5000/signUp", { username, email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Signup successful!");
        onLoginSuccess && onLoginSuccess();
        setIsOpen();
      } catch (err) {
        const msg = err.response?.data?.error || "OTP verification or signup failed";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    } 
    else {
      // Normal login
      try {
        setLoading(true);
        const res = await axios.post("http://localhost:5000/login", { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Login successful!");
        onLoginSuccess && onLoginSuccess();
        setIsOpen();
      } catch (err) {
        const msg = err.response?.data?.error || "Login failed";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form className="form" onSubmit={handleOnSubmit}>
      {step === "form" && (
        <>
          {isSignUp && (
            <div className="form-control">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                className="input"
                required
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input"
              required
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || otpSent}
            />
          </div>

          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input"
              required
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </>
      )}

      {step === "otp" && (
        <div className="form-control">
          <label htmlFor="otp">Enter OTP</label>
          <input
            type="text"
            id="otp"
            className="input"
            required
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading}
          />
        </div>
      )}

      <button
        type="submit"
        className="btn"
        disabled={(isSignUp && step === "form" && otpSent) || loading}
      >
        {step === "otp"
          ? loading
            ? "Verifying..."
            : "Verify OTP"
          : isSignUp
          ? "Sign Up"
          : "Login"}
      </button>

      {error && <h6 className="error">{error}</h6>}

      {step === "form" && (
        <p
          onClick={() => {
            setSignUp(!isSignUp);
            setStep("form");
            setOtpSent(false);
            setError("");
          }}
          className="para-link"
        >
          {isSignUp ? "Already have an account? Login now" : "Create new account"}
        </p>
      )}
    </form>
  );
}

export default InputForm;
