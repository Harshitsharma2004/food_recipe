const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    ingredients: {
        type: Array, // or [String] if list of items
        required: true
    },
    instructions: {
        type: String,
        required: true,
        trim: true
    },
    time: {
        type: String,
        trim: true
    },
    coverImage: {
        type: String
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Recipe", recipeSchema);
