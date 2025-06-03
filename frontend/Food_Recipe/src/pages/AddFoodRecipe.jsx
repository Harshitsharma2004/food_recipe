import React, { useState } from 'react';
import './AddFoodRecipe.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddFoodRecipe() {
  const [recipeData, setRecipeData] = useState({
    title: '',
    time: '',
    ingredients: '',
    instructions: '',
    file: null
  });

  const navigate = useNavigate();

  const onHandleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setRecipeData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setRecipeData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onHandleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', recipeData.title);
    formData.append('time', recipeData.time);
    formData.append('ingredients', recipeData.ingredients); // you can split it on backend
    formData.append('instructions', recipeData.instructions);
    formData.append('file', recipeData.file);

    try {
      await axios.post('http://localhost:5000/recipe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      navigate('/');
    } catch (err) {
      console.error('Error adding recipe:', err);
      alert('Failed to add recipe. Please try again.');
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={onHandleSubmit}>
        <h2 className="form-title">Add New Recipe</h2>

        <div className="form-control">
          <label htmlFor="title">Title</label>
          <input type="text" className="input" name="title" placeholder="Enter recipe title" onChange={onHandleChange} required />
        </div>

        <div className="form-control">
          <label htmlFor="time">Time</label>
          <input type="text" className="input" name="time" placeholder="e.g., 30 minutes" onChange={onHandleChange} required/>
        </div>

        <div className="form-control">
          <label htmlFor="ingredients">Ingredients</label>
          <textarea className="input" name="ingredients" rows="4" placeholder="List ingredients separated by commas..." onChange={onHandleChange} required></textarea>
        </div>

        <div className="form-control">
          <label htmlFor="instructions">Instructions</label>
          <textarea className="input" name="instructions" rows="5" placeholder="Write instructions here..." onChange={onHandleChange} required></textarea>
        </div>

        <div className="form-control">
          <label htmlFor="file">Recipe Image</label>
          <input type="file" className="input" name="file" accept="image/*" onChange={onHandleChange} required/>
        </div>

        <button type="submit" className="submit-button">Add Recipe</button>
      </form>
    </div>
  );
}

export default AddFoodRecipe;
