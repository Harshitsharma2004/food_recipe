import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import foodImg from "../assets/food-banner.jpg";
import { format } from "date-fns";
// import "./RecipeDetail.css";
// import '../assets/styles/main.css'


function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    const fetchRecipeAndCreator = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/recipe/${id}`);
        setRecipe(res.data);

        if (res.data.createdBy) {
          const userRes = await axios.get(
            `http://localhost:5000/user/${res.data.createdBy}`
          );
          setCreator(userRes.data);
        }
      } catch (error) {
        console.error("Error fetching recipe or creator:", error);
      }
    };

    fetchRecipeAndCreator();
  }, [id]);

  if (!recipe) {
    return <p>Loading recipe details...</p>;
  }

  return (
    <div className="recipe-detail-container">
      <h2 className="recipe-detail-title">{recipe.title}</h2>

      <img
        src={
          recipe.coverImage
            ? `http://localhost:5000/images/${recipe.coverImage}`
            : foodImg
        }
        alt={recipe.title}
        className="recipe-detail-image"
      />

      <p className="recipe-detail-paragraph">
        <span className="recipe-detail-label">Time:</span> {recipe.time}
      </p>

      <p className="recipe-detail-paragraph">
        <span className="recipe-detail-label">Instructions:</span>{" "}
        {recipe.instructions}
      </p>

      <p className="recipe-detail-label">Ingredients:</p>
      <ul className="recipe-detail-list">
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>

      <p className="recipe-detail-paragraph">
        <span className="recipe-detail-label">Posted By:</span>{" "}
        {creator ? creator.username : "Loading..."}
      </p>

      <p className="recipe-detail-footer">
        Created on: {format(new Date(recipe.createdAt), "MMMM dd, yyyy")}
      </p>
    </div>
  );
}

export default RecipeDetail;
