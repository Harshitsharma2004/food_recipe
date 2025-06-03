const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Recipe = require("../models/recipe");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// DELETE /profile/:id
router.delete("/:id", async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Soft delete user's recipes
    await Recipe.updateMany({ createdBy: user._id }, { $set: { isDeleted: true } });

    // Soft delete user account
    user.isDeleted = true;
    await user.save();

    res.json({ message: "User and their recipes have been soft deleted." });
  } catch (err) {
    console.error("Error soft deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
