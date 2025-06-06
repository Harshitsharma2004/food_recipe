import React, { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import foodImg from "../assets/food-banner.jpg";
import { FaHeart, FaEdit } from "react-icons/fa";
import { BsFillStopwatchFill } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function RecipeItems() {
  const recipes = useLoaderData();
  const [allRecipes, setAllRecipes] = useState([]);
  const [favourites, setFavourites] = useState(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const pathname = window.location.pathname;
  const isMyRecipe = pathname === "/myRecipe";
  const isFavRecipe = pathname === "/favRecipe";

  const getAllRecipes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/recipe");
      return res.data;
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
  };

  const getMyRecipes = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;
    if (!userId) return [];

    const data = await getAllRecipes();
    const filtered = data.filter((item) => {
      const createdById = item.createdBy?._id || item.createdBy;
      return String(createdById).trim() === String(userId).trim();
    });

    return filtered;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isFavRecipe) {
        const favItems = JSON.parse(localStorage.getItem("fav")) || [];
        setAllRecipes(favItems);
      } else if (isMyRecipe) {
        const myRecipes = await getMyRecipes();
        setAllRecipes(myRecipes);
      } else {
        const all = await getAllRecipes();
        setAllRecipes(all);
      }
      setCurrentPage(1); // reset to first page
    };

    fetchData();
  }, [isFavRecipe, isMyRecipe]);

  useEffect(() => {
    const favItems = JSON.parse(localStorage.getItem("fav")) || [];
    const favIds = new Set(favItems.map((item) => item._id));
    setFavourites(favIds);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

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
    if (isFavRecipe) setAllRecipes(favItems);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    try {
      await axios.delete(`http://localhost:5000/recipe/${id}`);
      setAllRecipes((prev) => prev.filter((recipe) => recipe._id !== id));

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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allRecipes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allRecipes.length / itemsPerPage);

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
        <>
          <div className="card-container">
            {currentItems.map((item, index) => {
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

          {totalPages > 1 && (
            <div
              className="pagination-controls"
              style={{ textAlign: "center", marginTop: "1.5rem" }}
            >
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  margin: "0 5px",
                  padding: "8px 12px",
                  backgroundColor: "#f0f0f0",
                  color: "black",
                  border: "none",
                  borderRadius: "5px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                <FaArrowLeft />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`pagination-btn ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                  style={{
                    margin: "0 5px",
                    padding: "8px 12px",
                    backgroundColor:
                      currentPage === i + 1 ? "#007bff" : "#f0f0f0",
                    color: currentPage === i + 1 ? "white" : "black",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={{
                  margin: "0 5px",
                  padding: "8px 12px",
                  backgroundColor: "#f0f0f0",
                  color: "black",
                  border: "none",
                  borderRadius: "5px",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                <FaArrowRight />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default RecipeItems;
