import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/theme")
      .then((res) => {
        if (res.data?.theme === "dark" || res.data?.theme === "light") {
          setTheme(res.data.theme);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch theme:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    axios
      .put(
        "/api/theme",
        { theme: newTheme },
        {
        }
      )
      .catch((err) => {
        console.error("Failed to update theme:", err);
      });
  };

  if (loading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "dark" ? "dark-theme" : ""}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
