const Recipes = require("../models/recipe");
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.fieldname
    cb(null, filename)
  }
})

const upload = multer({ storage: storage })
// Getting all recipes
const getRecipes = async (req, res) => {
    try {
        const recipes = await Recipes.find()
        return res.json(recipes)
    } catch (err) {
        return res.status(404).json({ message: "Error in getting all recipes" })
    }
};

// Getting desired recipe
const getRecipe = async (req, res) => {
    try {
        const recipe = await Recipes.findById(req.params.id);
        res.json(recipe);
    } catch (err) {
        return res.status(404).json({ message: "Error in getting desired recipe" })

    }
};


//Add new recipe
const addRecipe = async (req, res) => {
    try {
        const { title, ingredients, instructions, time } = req.body;

        // Validation
        if (!title || !ingredients || !instructions) {
            return res.status(400).json({ message: "Required fields can't be empty" });
        }

        // Create new recipe
        const newRecipe = await Recipes.create({
            title,
            ingredients,
            instructions,
            time,
            coverImage:req.file.filename,
            createdBy:req.user.id
        });

        return res.status(201).json(newRecipe);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong while adding the recipe." });
    }
};

// Edit an recipe
const editRecipe = async (req, res) => {
  const { title, ingredients, instructions, time } = req.body;

  try {
    const recipe = await Recipes.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Prepare the updated data
    const updatedData = {
      title,
      ingredients: ingredients.split(','), // Assuming ingredients sent as CSV string
      instructions,
      time,
    };

    // Only update the coverImage if a new file was uploaded
    if (req.file) {
      updatedData.coverImage = req.file.filename;
    }

    // Perform the update
    const updatedRecipe = await Recipes.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error("Edit recipe failed:", error);
    return res.status(500).json({ message: "Error updating recipe" });
  }
};



//Delete an recipe
const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipes.deleteOne({_id:req.params.id});
        res.json({ message: "Deleted Successfully" });
    } catch (err) {
        return res.status(404).json({ message: "Error in deletion" })

    }
};

module.exports = { getRecipes, getRecipe, addRecipe, editRecipe, deleteRecipe, upload };