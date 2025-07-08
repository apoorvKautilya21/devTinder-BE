const express = require('express');
const connectDB = require('./config/database');
const userModel = require('./models/user');
const app = express();
const { validateSignup } = require('./utils/validation');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { userAuth } = require('./middleware/auth');

app.use(express.json());
app.use(cookieParser());

app.post('/signup', async (req, res) => {
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

app.post('/login', async (req, res) => {
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

app.get('/profile', userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(400).send({message: err.message});
  }
});

app.get('/sendConnectionRequest', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send({message: `${user.firstName} sent you a connection request`});
  } catch (err) {
    res.status(400).send({message: err.message});
  }
})

try {
  connectDB()
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(7777, () => {
        console.log('Server is running on port 7777');
      })
    })
} catch (error) {
  console.log(error);
}