import React, { useState, useEffect } from "react";
// import "../assets/styles/main.css";
// import '../assets/styles/dark.css'
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// import { useTheme } from "../ThemeContext";
// import ThemeToggle from "./ThemeToggle";

const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  // const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const storedProfile = localStorage.getItem("user");
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch (error) {
        console.error("Error parsing profile from localStorage", error);
      }
    }
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify(profile));
    toast.success("Profile saved successfully!");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Validate on input change
    let errorMsg = "";

    if (!value.trim()) {
      errorMsg = "This field is required.";
    } else if (name === "newPassword") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])[\S]{8,}$/;
      if (!passwordRegex.test(value)) {
        errorMsg =
          "Must be 8+ chars, include uppercase, lowercase, special char, and no spaces.";
      }
      // Check confirm password match
      if (
        passwordData.confirmPassword &&
        value !== passwordData.confirmPassword
      ) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    } else if (name === "confirmPassword") {
      if (value !== passwordData.newPassword) {
        errorMsg = "Passwords do not match.";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setIsLoading(true);

    const currentErrors = {};
    if (!passwordData.currentPassword.trim())
      currentErrors.currentPassword = "Current password is required.";
    if (!passwordData.newPassword.trim())
      currentErrors.newPassword = "New password is required.";
    if (!passwordData.confirmPassword.trim())
      currentErrors.confirmPassword = "Please confirm your new password.";

    if (
      passwordData.newPassword &&
      passwordData.confirmPassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    )
      currentErrors.confirmPassword = "Passwords do not match.";

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])[\S]{8,}$/;
    if (
      passwordData.newPassword &&
      !passwordRegex.test(passwordData.newPassword)
    )
      currentErrors.newPassword =
        "Must be 8+ chars, include uppercase, lowercase, special char, and no spaces.";

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      setIsLoading(false);
      Object.values(currentErrors).forEach((msg) => {
        if (msg) toast.error(msg);
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Password updated successfully. Please login again.", {
        onClose: () => window.location.reload(),
      });

      localStorage.removeItem("token");
      navigate("/");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (error) {
      const data = error.response?.data;

      if (data?.errors) {
        setErrors(data.errors);
        Object.values(data.errors).forEach((msg) => {
          if (msg) toast.error(msg);
        });
      } else if (data?.message) {
        toast.success(data.message);
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.error("Logged out successfully!", {
      onClose: () => window.location.reload(),
    });
    navigate("/");
  };

  // Render content based on selected tab
  const renderContent = () => {
    const haserrors = Object.values(errors).some((msg) => msg);
    const isFormIncomplete =
      !passwordData.currentPassword.trim() ||
      !passwordData.newPassword.trim() ||
      !passwordData.confirmPassword.trim();
    switch (activeSection) {
      case "profile":
        return (
          <>
            <form onSubmit={handleProfileSave}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={profile.username}
                  onChange={handleProfileChange}
                  readOnly
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  readOnly
                />
              </label>
            </form>
            <button
              onClick={handleLogout}
              className="btn-danger"
              style={{ marginTop: "20px" }}
            >
              Logout
            </button>
          </>
        );

      case "changePassword":
        return (
          <form onSubmit={handlePasswordSubmit}>
            {/* General error message if exists */}
            {errors.general && (
              <div
                className="error-text general-error"
                style={{ marginBottom: "1rem" }}
              >
                {errors.general}
              </div>
            )}

            <label>
              Current Password:
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={errors.currentPassword ? "input-error" : ""}
                required
              />
              {errors.currentPassword && (
                <small className="error-text">{errors.currentPassword}</small>
              )}
            </label>

            <label>
              New Password:
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={errors.newPassword ? "input-error" : ""}
                required
              />
              {errors.newPassword && (
                <small className="error-text">{errors.newPassword}</small>
              )}
            </label>

            <label>
              Confirm New Password:
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={errors.confirmPassword ? "input-error" : ""}
                required
              />
              {errors.confirmPassword && (
                <small className="error-text">{errors.confirmPassword}</small>
              )}
            </label>

            <button
              type="submit"
              disabled={isLoading || haserrors || isFormIncomplete}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <span className="spinner" aria-label="Loading"></span> Please
                  wait...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </form>
        );
        
        case "privacyPolicy":
        return (
          <div
            style={{ maxHeight: "auto", overflowY: "auto", padding: "1rem" }}
          >
            <h1>Privacy Policy For "Plated Poetry"</h1>
            <p>
              <strong>Effective Date:</strong> June 03, 2025
            </p>
            <p>
              At <strong>Plated Poetry</strong>, one of our main priorities is
              the privacy of our visitors...
            </p>
          </div>
        );

      case "deleteProfile":
        return (
          <div>
            <p>
              Warning: Deleting your profile is permanent and cannot be undone.
              Please confirm your password to proceed.
            </p>
            <input
              type="password"
              placeholder="Enter your password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              required
            />
            <button
              className="btn-danger"
              onClick={() => {
                /* Your delete logic here */
              }}
            >
              Delete Profile
            </button>
          </div>
        );

      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2 className="sidebar-title">Dashboard</h2>
        <ul className="nav-list">
          <li
            className={activeSection === "profile" ? "active" : ""}
            onClick={() => setActiveSection("profile")}
          >
            Profile
          </li>
          <li
            className={activeSection === "changePassword" ? "active" : ""}
            onClick={() => setActiveSection("changePassword")}
          >
            Change Password
          </li>
          <li
            className={activeSection === "privacyPolicy" ? "active" : ""}
            onClick={() => setActiveSection("privacyPolicy")}
          >
            Privacy Policy
          </li>
          <li
            className={
              activeSection === "deleteProfile" ? "active delete" : "delete"
            }
            onClick={() => setActiveSection("deleteProfile")}
          >
            Delete Profile
          </li>
        </ul>
      </div>

      <div className="content">
        <h1 className="section-title">
          {activeSection.replace(/([A-Z])/g, " $1")}
        </h1>
        <div className="section-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default UserDashboard;
