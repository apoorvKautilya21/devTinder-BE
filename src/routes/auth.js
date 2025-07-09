const express = require('express');
const { validateSignup } = require('../utils/validation');
const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
  try {
    // validate the request body
    validateSignup(req.body);

    // encrypt the password
    const { firstName, lastName, emailId, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // create a new user
    const user = new userModel({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body || {};

    const user = await userModel.findOne({ emailId });
    if (!user) {
      // don't send the specified error message like Invalid email
      // because it will give away the information about the user
      throw new Error('Invalida credentials');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate a JWT token
    const jwtToken = await user.getJWT();
    
    // Send the token via cookie
    res.cookie("token", jwtToken, {
      // httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.send({ message: 'Login successful' });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

authRouter.post('/logout', async (req, res) => {
  res.cookies('token', null, new Date(Date.now()));

  res.send({ message: 'Logout successful' });
});

module.exports = authRouter;