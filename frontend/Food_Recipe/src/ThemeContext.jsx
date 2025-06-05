import axios from "axios";
import { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/theme", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.data?.theme === "dark" || res.data?.theme === "light") {
          setTheme(res.data.theme);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch theme:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    axios
      .put(
        "/theme",
        { isDark: newTheme === "dark" }, // ✅ fixed here
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .catch((err) => {
        console.error("Failed to update theme:", err);
      });
  };

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
