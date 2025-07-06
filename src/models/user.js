const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
  },
  password: {
    type: String,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
  }
});

// collection name is users in database
// if collection name is not provided, it will be the plural of the model name
// if collection name is provided, it will be the name of the collection
const userModel = new mongoose.model('User', userSchema);

module.exports = userModel;
