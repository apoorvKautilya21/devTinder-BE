const mongoose = require("mongoose");
require('dotenv').config();
const URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(URI);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
