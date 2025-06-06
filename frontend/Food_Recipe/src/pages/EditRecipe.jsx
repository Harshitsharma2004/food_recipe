import React, { useEffect, useState } from "react";
// import "./AddFoodRecipe.css";

import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditRecipe() {
  const [recipeData, setRecipeData] = useState({
    title: "",
    time: "",
    ingredients: "",
    instructions: "",
    file: null,
    coverImage: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/recipe/${id}`);
        const res = response.data;
        setRecipeData({
          title: res.title,
          ingredients: res.ingredients.join(","),
          instructions: res.instructions,
          time: res.time,
          coverImage: res.coverImage, // e.g. 'image123.jpg' or a full URL
          file: null,
        });
      } catch (err) {
        console.error("Failed to fetch recipe:", err);
      }
    };
    getData();
  }, [id]);

  const onHandleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setRecipeData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setRecipeData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onHandleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", recipeData.title);
    formData.append("time", recipeData.time);
    formData.append("ingredients", recipeData.ingredients);
    formData.append("instructions", recipeData.instructions);

    if (recipeData.file) {
      formData.append("file", recipeData.file);
    }

    try {
      await axios.put(`http://localhost:5000/recipe/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      navigate("/myRecipe");
    } catch (err) {
      console.error("Error updating recipe:", err);
      alert("Failed to update recipe. Please try again.");
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={onHandleSubmit}>
        <h2 className="form-title">Add New Recipe</h2>

        <div className="form-control">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            className="input"
            name="title"
            placeholder="Enter recipe title"
            onChange={onHandleChange}
            required
            value={recipeData.title}
          />
        </div>

        <div className="form-control">
          <label htmlFor="time">Time</label>
          <input
            type="text"
            className="input"
            name="time"
            placeholder="e.g., 30 minutes"
            onChange={onHandleChange}
            required
            value={recipeData.time}
          />
        </div>

        <div className="form-control">
          <label htmlFor="ingredients">Ingredients</label>
          <textarea
            className="input"
            name="ingredients"
            rows="4"
            placeholder="List ingredients separated by commas..."
            onChange={onHandleChange}
            required
            value={recipeData.ingredients}
          ></textarea>
        </div>

        <div className="form-control">
          <label htmlFor="instructions">Instructions</label>
          <textarea
            className="input"
            name="instructions"
            rows="5"
            placeholder="Write instructions here..."
            onChange={onHandleChange}
            required
            value={recipeData.instructions}
          ></textarea>
        </div>

        <div className="form-control">
          <label htmlFor="file">Recipe Image</label>
          {recipeData.coverImage && (
            <div className="existing-image-preview">
              <p>Current Image:</p>
              <img
                src={`http://localhost:5000/images/${recipeData.coverImage}`}
                alt="Current Recipe"
                style={{
                  width: "200px",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
            </div>
          )}
          <input
            type="file"
            className="input"
            name="file"
            accept="image/*"
            onChange={onHandleChange}
          />
        </div>

        <button type="submit" className="submit-button">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditRecipe;
