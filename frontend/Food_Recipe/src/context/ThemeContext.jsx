import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ user, children }) => {
  // Initialize theme from localStorage, fallback to user prop, else false
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("isDark");
    if (saved !== null) return saved === "true";
    return user?.isDark || false;
  });

  // Enable/disable CSS files dynamically
  const toggleCss = (darkMode) => {
    const mainCss = document.getElementById("main-css");
    const darkCss = document.getElementById("dark-css");

    if (mainCss && darkCss) {
      if (darkMode) {
        mainCss.disabled = true;
        darkCss.disabled = false;
      } else {
        mainCss.disabled = false;
        darkCss.disabled = true;
      }
    }
  };

  // Sync CSS and localStorage whenever theme changes
  useEffect(() => {
    toggleCss(isDark);
    localStorage.setItem("isDark", isDark);

    // Save theme preference to backend
    const saveThemePreference = async () => {
      try {
        const token = localStorage.getItem("token"); // your auth token
        if (!token) return;

        const res = await fetch("http://localhost:5000/theme", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isDark }),
        });

        if (!res.ok) {
          console.error("Failed to save theme preference");
        }
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    };

    saveThemePreference();
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
