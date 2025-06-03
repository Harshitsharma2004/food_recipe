const express = require('express');
const router = express.Router();

const { getRecipes,getRecipe,addRecipe,editRecipe,deleteRecipe, upload } = require('../controller/recipe');
const verifyToken = require('../middleware/auth');

router.get('/',getRecipes);// use for get all the recipe
router.get('/:id',getRecipe);// use to get individual recipe
router.post("/",upload.single('file'),
verifyToken,
 addRecipe);// use to add recipe
router.put('/:id',upload.single('file'),editRecipe);// use to edit the recipe
router.delete('/:id',deleteRecipe); // use to delete the recipe

module.exports= router;