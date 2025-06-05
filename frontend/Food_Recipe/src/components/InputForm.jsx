import React, { useState } from "react";
import '../assets/styles/main.css'
import axios from "axios";
import { toast } from "react-toastify";

function InputForm({ setIsOpen, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setSignUp] = useState(false);

  // OTP flow states
  const [step, setStep] = useState("form"); // "form" | "otp" | "password"
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])[\S]{8,}$/;

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isSignUp) {
        if (step === "form") {
          // Step 1: Send OTP to email
          if (!email) {
            toast.error("Please enter your email.");
            setLoading(false);
            return;
          }
          await axios.post("http://localhost:5000/otp-verification/send-otp", { email });
          toast.info("OTP sent to your email!");
          setStep("otp");
        } else if (step === "otp") {
          // Step 2: Verify OTP
          if (!otp) {
            toast.error("Please enter the OTP.");
            setLoading(false);
            return;
          }
          await axios.post("http://localhost:5000/otp-verification/verify-otp", { email, otp });
          toast.success("OTP verified! Now set your password.");
          setStep("password");
        } else if (step === "password") {
          // Step 3: Validate password & create account
          if (!username) {
            toast.error("Please enter a username.");
            setLoading(false);
            return;
          }
          if (!passwordRegex.test(password)) {
            toast.error("Password must be at least 8 characters, contain uppercase and lowercase letters, one special character, and no spaces.");
            setLoading(false);
            return;
          }

          const res = await axios.post("http://localhost:5000/signUp", { username, email, password });
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          toast.success("Signup successful!");
          onLoginSuccess && onLoginSuccess();
          setIsOpen();
        }
      } else {
        // Login flow
        if (!email || !password) {
          toast.error("Please enter email and password.");
          setLoading(false);
          return;
        }
        const res = await axios.post("http://localhost:5000/login", { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Login successful!");
        onLoginSuccess && onLoginSuccess();
        setIsOpen();
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "An error occurred";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setSignUp(!isSignUp);
    setStep("form");
    setEmail("");
    setPassword("");
    setUsername("");
    setOtp("");
  };

  return (
    <form className="form" onSubmit={handleOnSubmit}>
      {(step === "form" || step === "password") && (
        <>
          {isSignUp && (
            <div className="form-control">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                className="input"
                required={step === "password"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                // disabled={loading || step === "form"} // disable username input until OTP verified
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || (isSignUp && step !== "form")} // disable email input after OTP sent
            />
          </div>

          {step === "password" && (
            <div className="form-control">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {!isSignUp && step === "form" && (
            <div className="form-control">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
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
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading}
          />
        </div>
      )}

      <button type="submit" className="btn" disabled={loading}>
        {isSignUp
          ? step === "form"
            ? loading
              ? "Sending OTP..."
              : "Send OTP"
            : step === "otp"
            ? loading
              ? "Verifying OTP..."
              : "Verify OTP"
            : step === "password"
            ? loading
              ? "Signing Up..."
              : "Sign Up"
            : "Sign Up"
          : loading
          ? "Logging in..."
          : "Login"}
      </button>

      {step === "form" && (
        <p onClick={toggleForm} className="para-link" style={{ cursor: "pointer" }}>
          {isSignUp ? "Already have an account? Login now" : "Create new account"}
        </p>
      )}
    </form>
  );
}

export default InputForm;
