const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// SIGN UP
const userSignUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, Email, and Password can't be empty" });
    }

    // Password validation regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])[\S]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long, contain uppercase and lowercase letters, one special character, and no spaces.",
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashPwd = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashPwd,
      isDeleted: false, // Optional
    });

    let token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.SECRET_KEY);
    return res.status(200).json({ token, user: newUser });

  } catch (error) {
    return res.status(400).json({ error: "Error in user creation" });
  }
};


// LOGIN
const userLogin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({ error: "Username or Email and Password can't be empty" });
    }

    // Step 1: Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username }],
      isDeleted: false
    });

    if (!user) {
      return res.status(400).json({ error: "Email or username not found" });
    }

    // Step 2: Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Step 3: Generate token and respond
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.SECRET_KEY
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isDark: user.isDark,
        isDeleted: user.isDeleted,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error in logging in" });
  }
};

// GET USER BY ID
const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false }); // ✅ Filter deleted users

    if (!user) {
      return res.status(404).json({ error: "User not found or has been deleted" });
    }

    res.json({ username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching user" });
  }
};

//Change Password API
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ errors: { general: "Current and new passwords are required." } });
    }

    const user = await User.findOne({ _id: userId, isDeleted: false });

    if (!user) {
      return res.status(404).json({ errors: { general: "User not found or account is deleted." } });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: { currentPassword: "Current password is incorrect." } });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });

  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ errors: { general: "Internal server error." } });
  }
};

const updateTheme = async (req, res) => {
  try {
    const userId = req.user.id;


    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: "User not found or deleted." });

    user.isDark = !user.isDark
    await user.save()

    return res.status(200).json({
      message: "Theme updated successfully.",
      isDark: user.isDark
    });
  } catch (error) {
    console.error("Theme Update Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};



module.exports = { userSignUp, userLogin, getUser, changePassword, updateTheme };
