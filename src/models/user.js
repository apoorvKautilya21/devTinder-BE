const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
    trim: true,
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email');
      }
    },
  },
  password: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isStrongPassword(value)) {
        throw new Error('Password is not strong enough');
      }
    },
  },
  age: {
    type: Number,
    min: 18,
    set(value) {
      return Math.round(value);
    },
    get(value) {
      return Math.round(value);
    },
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
    default: 'https://smsdelhibmw.co.in/wp-content/uploads/2022/02/User-Profile-PNG.png',
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error('Invalid photo URL');
      }
    },
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

// don't use arrow function here
// because we need to use the this keyword
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user?._id }, process.env.JWT_SECRET, { expiresIn: '1D' });

  return token;
}

userSchema.methods.validatePassword = async function (passwordFromRequest) {
  const user = this;
  const passwordHash = user?.password;
  const isPasswordValid = await bcrypt.compare(passwordFromRequest, passwordHash);

  return isPasswordValid;
}

// collection name is users in database
// if collection name is not provided, it will be the plural of the model name
// if collection name is provided, it will be the name of the collection
const userModel = new mongoose.model('User', userSchema);

module.exports = userModel;
