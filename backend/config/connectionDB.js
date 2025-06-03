const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      // these options are optional in Mongoose 6+, but you can include them if you want
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Exit the process with failure
    process.exit(1);
  }
};

module.exports = connectDB;