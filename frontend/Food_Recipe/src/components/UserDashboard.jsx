import React, { useState, useEffect } from "react";
import "./UserDashboard.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../ThemeContext";

const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState("profile");

  // Profile state with default values
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
  });

  // Load profile from localStorage on component mount
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

  // Change Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Theme state
  const { theme, toggleTheme } = useTheme();

  // Delete Profile confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile and update localStorage
  const handleProfileSave = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify(profile));
    alert("Profile saved!");
  };

  // Password form handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Logout Functionality
  let navigate = useNavigate();
  const handleLogout = (e) => {
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("Logged out successfully!");
      // Redirect or update UI as needed, e.g.:
      navigate("/");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/change-password", // <-- Fixed endpoint
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordSuccess(res.data.message || "Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      setPasswordError(
        error.response?.data?.message || "Failed to change password"
      );
    }
  };

  // Delete profile handler
  // Handle delete
  const handleDeleteProfile = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const password = passwordData.currentPassword;

    if (!user || !user.id || !password) {
      toast.error("Please enter your password to confirm.");
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/profile/${user.id}`,
        {
          data: { password }, // Required for DELETE with body
        }
      );

      toast.success(response.data.message || "User deleted.");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (err) {
      console.error("Delete error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to delete account.");
    }
  };

  // Content render
  const renderContent = () => {
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
              {/* <button type="submit" className="btn-primary">
                Save Profile
              </button> */}
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
            <label>
              Current Password:
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </label>
            <label>
              New Password:
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </label>
            <label>
              Confirm New Password:
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </label>
            {passwordError && <p className="error">{passwordError}</p>}
            {passwordSuccess && <p className="success">{passwordSuccess}</p>}
            <button type="submit" className="btn-primary">
              Change Password
            </button>
          </form>
        );

      case "theme":
        return (
          <div>
            <p>
              Current theme: <b>{theme}</b>
            </p>
            <button onClick={toggleTheme} className="btn-primary">
              Toggle to {theme === "light" ? "Dark" : "Light"} Mode
            </button>
          </div>
        );

      case "privacyPolicy":
        return (
          <div
            style={{ maxHeight: "auto", overflowY: "auto", padding: "1rem" }}
          >
            <h1>Privacy Policy For "Plated Poetry"</h1>
            <p>
              <strong>Effective Date:</strong> June 03,2025
            </p>

            <p>
              At <strong>Plated Poetry</strong>, one of our main priorities is
              the privacy of our visitors. This Privacy Policy document outlines
              the types of information that are collected and recorded by{" "}
              <strong>Plated Poetry</strong> and how we use it.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We may collect personal information from you when you:</p>
            <ul>
              <li>Register on our website</li>
              <li>Subscribe to our newsletter</li>
              <li>Comment on recipes or blog posts</li>
              <li>Contact us via forms or email</li>
            </ul>

            <p>The personal information collected may include:</p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>IP address</li>
              <li>Any other information you voluntarily provide</li>
            </ul>

            <p>We also collect non-personally identifiable data such as:</p>
            <ul>
              <li>Browser type</li>
              <li>Operating system</li>
              <li>Pages visited</li>
              <li>Time and date of visit</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To provide, operate, and maintain our website</li>
              <li>To personalize your experience on our website</li>
              <li>To improve our website’s functionality and content</li>
              <li>To send you newsletters or updates if you opt-in</li>
              <li>To respond to inquiries and provide support</li>
              <li>To monitor and analyze trends and usage</li>
            </ul>

            <h2>3. Cookies</h2>
            <p>
              <strong>Your Website Name</strong> uses cookies to:
            </p>
            <ul>
              <li>Store user preferences</li>
              <li>Analyze traffic and user behavior</li>
              <li>Improve site performance and usability</li>
            </ul>
            <p>
              You can choose to disable cookies through your browser settings.
              Note that disabling cookies may affect how you interact with our
              website.
            </p>

            <h2>4. Third-Party Services</h2>
            <p>
              We may use third-party services such as Google Analytics or
              advertising networks. These services may use cookies and collect
              data in accordance with their own privacy policies.
            </p>
            <p>
              We are not responsible for the privacy practices of third-party
              websites or services.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We take reasonable steps to protect your personal information from
              unauthorized access, disclosure, or destruction. However, no
              method of transmission over the internet is 100% secure.
            </p>

            <h2>6. Children’s Privacy</h2>
            <p>
              Our website is not intended for children under the age of 13. We
              do not knowingly collect personal information from children.
            </p>

            <h2>7. Your Consent</h2>
            <p>
              By using our website, you hereby consent to our Privacy Policy and
              agree to its terms.
            </p>

            <h2>8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. Any changes
              will be posted on this page with an updated “Effective Date.”
            </p>

            {/* <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, you can
              contact us at:
            </p> */}
            {/* <p>
              <strong>Your Website Name</strong>
              <br />
              Email:{" "}
              <a href="mailto:yourcontactemail@example.com">
                yourcontactemail@example.com
              </a>
              <br />
            </p> */}
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
            <button onClick={handleDeleteProfile} className="btn-danger">
              Delete Profile
            </button>
          </div>
        );

      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className={`dashboard ${theme === "dark" ? "dark-theme" : ""}`}>
      {/* Sidebar */}
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
            className={activeSection === "theme" ? "active" : ""}
            onClick={() => setActiveSection("theme")}
          >
            Theme
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

      {/* Main Content */}
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
