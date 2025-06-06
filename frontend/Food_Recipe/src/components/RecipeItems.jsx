import React, { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import foodImg from "../assets/food-banner.jpg";
import { FaHeart, FaEdit } from "react-icons/fa";
import { BsFillStopwatchFill } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
// import "./RecipeItems.css";
// import '../assets/styles/main.css'

import axios from "axios";

function RecipeItems() {
  const recipes = useLoaderData();
  const [allRecipes, setAllRecipes] = useState([]);
  const [favourites, setFavourites] = useState(new Set());

  const pathname = window.location.pathname;
  const isMyRecipe = pathname === "/myRecipe";
  const isFavRecipe = pathname === "/favRecipe";

  // Fetch all recipes
  const getAllRecipes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/recipe");
      // console.log("Fetched from server:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
  };

  // Get only recipes created by current user
  const getMyRecipes = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;
    // console.log("Logged in user:", user);

    if (!userId) return [];

    const data = await getAllRecipes();
    // console.log("All recipes:", data);

    const filtered = data.filter((item) => {
      const createdById = item.createdBy?._id || item.createdBy; // supports both object and direct ID
      // console.log("Recipe:", item.title || item.name, "CreatedBy ID:", createdById, "User ID:", userId);
      return String(createdById).trim() === String(userId).trim();
    });

    // console.log("Filtered my recipes:", filtered);
    return filtered;
  };

  // Load appropriate recipes on mount
  useEffect(() => {
    const fetchData = async () => {
      // console.log("isFavRecipe:", isFavRecipe, "isMyRecipe:", isMyRecipe);

      if (isFavRecipe) {
        const favItems = JSON.parse(localStorage.getItem("fav")) || [];
        // console.log("Loading favorites:", favItems);
        setAllRecipes(favItems);
      } else if (isMyRecipe) {
        // console.log("Fetching my recipes...");
        const myRecipes = await getMyRecipes();
        // console.log("Filtered my recipes:", myRecipes);
        setAllRecipes(myRecipes);
      } else {
        // console.log("Fetching all recipes...");
        const all = await getAllRecipes();
        setAllRecipes(all);
      }
    };

    fetchData();
  }, [isFavRecipe, isMyRecipe]);

  // Sync favourites from localStorage on mount
  useEffect(() => {
    const favItems = JSON.parse(localStorage.getItem("fav")) || [];
    const favIds = new Set(favItems.map((item) => item._id));
    setFavourites(favIds);
  }, []);

  // Handle favourite toggle
  const handleFavouriteToggle = (item) => {
    const id = item._id;
    const newFavourites = new Set(favourites);
    let favItems = JSON.parse(localStorage.getItem("fav")) || [];

    if (newFavourites.has(id)) {
      newFavourites.delete(id);
      favItems = favItems.filter((r) => r._id !== id);
    } else {
      newFavourites.add(id);
      if (!favItems.find((r) => r._id === id)) {
        favItems.push(item);
      }
    }

    setFavourites(newFavourites);
    localStorage.setItem("fav", JSON.stringify(favItems));
    if (isFavRecipe) setAllRecipes(favItems); // Live update for /favRecipe
  };

  // Handle delete
  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    try {
      await axios.delete(`http://localhost:5000/recipe/${id}`);
      setAllRecipes((prev) => prev.filter((recipe) => recipe._id !== id));

      // Also remove from favourites if exists
      const favItems = JSON.parse(localStorage.getItem("fav")) || [];
      const updatedFavs = favItems.filter((r) => r._id !== id);
      localStorage.setItem("fav", JSON.stringify(updatedFavs));

      setFavourites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("Failed to delete recipe.");
    }
  };

  return (
    <>
      {allRecipes?.length === 0 ? (
        <p
          style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.2rem" }}
        >
          {isMyRecipe
            ? "You haven't posted any recipes yet."
            : isFavRecipe
            ? "No favourite items yet."
            : "No recipes found."}
        </p>
      ) : (
        <div className="card-container">
          {allRecipes.map((item, index) => {
            const id = item._id || index;
            return (
              <div key={id} className="card">
                <Link to={`/recipe/${item._id}`} className="card-link">
                  <img
                    src={
                      item.coverImage
                        ? `http://localhost:5000/images/${item.coverImage}`
                        : foodImg
                    }
                    alt={item.title || "Delicious recipe"}
                    width="120px"
                    height="100px"
                  />
                  <div className="card-body">
                    <div className="title">{item.title}</div>
                  </div>
                </Link>

                {/* Time and icons in one row */}
                <div className="info-row">
                  <div className="open">
                    <BsFillStopwatchFill />
                    {item.time}
                  </div>
                  <div className="icons">
                    <div
                      className={`like ${favourites.has(id) ? "active" : ""}`}
                      onClick={() => handleFavouriteToggle(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleFavouriteToggle(item)
                      }
                      aria-label="Toggle favourite"
                    >
                      <FaHeart color={favourites.has(id) ? "red" : "gray"} />
                    </div>
                    {isMyRecipe && (
                      <>
                        <Link
                          to={`/editRecipe/${item._id}`}
                          aria-label="Edit recipe"
                        >
                          <FaEdit />
                        </Link>
                        <MdDeleteForever
                          onClick={() => onDelete(item._id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && onDelete(item._id)
                          }
                          aria-label="Delete recipe"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default RecipeItems;
