const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  lastName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 18,
  },
  gender: {
    type: String,
    validate(value) {
      if (!['male', 'female', 'other'].includes(value)) {
        throw new Error('Invalid gender');
      }
    },
  },
  photoUrl: {
    type: String,
    default: 'https://smsdelhibmw.co.in/wp-content/uploads/2022/02/User-Profile-PNG.png'
  },
  about: {
    type: String,
    default: 'Nothing about me.',
  },
  skills: {
    type: [String],
  },
}, {
  timestamps: true,
});

// collection name is users in database
// if collection name is not provided, it will be the plural of the model name
// if collection name is provided, it will be the name of the collection
const userModel = new mongoose.model('User', userSchema);

module.exports = userModel;
