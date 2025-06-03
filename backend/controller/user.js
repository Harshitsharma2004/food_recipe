const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// SIGN UP
const userSignUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, Email, and Password can't be empty" });
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
      isDeleted: false // Optional, only if not default in model
    });

    let token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.SECRET_KEY);
    return res.status(200).json({ token, user: newUser });

  } catch (error) {
    return res.status(400).json({ message: "Error in user creation" });
  }
};

// LOGIN
const userLogin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({ message: "Username or Email and Password can't be empty" });
    }

    const user = await User.findOne({
      $or: [{ email }, { username }],
      isDeleted: false // ✅ Only fetch active users
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id },
        process.env.SECRET_KEY
      );

      return res.status(200).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      return res.status(400).json({ error: "Invalid credentials or account deleted" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in logging in" });
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
    res.status(500).json({ message: "Error fetching user" });
  }
};

module.exports = { userSignUp, userLogin, getUser };
