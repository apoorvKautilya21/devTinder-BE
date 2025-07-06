const express = require('express');
const connectDB = require('./config/database');
const userModel = require('./models/user');
const app = express();

app.use(express.json());

app.post('/signup', async (req, res) => {
  try {
    const user = new userModel(req.body);
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get user by emailId
app.get('/user', async (req, res) => {
  const emailId = req.body.emailId;
  try {
    const users = await userModel.find({ emailId });
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    } else {
      res.send({user: users[0]});
    }
  } catch (err) {
    res.status(400).send('Internal Server Error');
  }
});

// FEED API /feed (GET) - get all users from the database
app.get('/feed', async(req, res) => {
  try {
    const users = await userModel.find({});

    res.send(users);
  } catch (err) {
    res.status(400).send('Internal Server Error');
  }
});

app.delete('/user', async (req, res) => {
  const id = req.body.userId;

  try {
    await userModel.findByIdAndDelete(id);

    await res.send({message: 'User deleted successfully'});
  } catch (err) {
    res.status(400).send('Internal Server Error');
  }
});

app.patch('/user/:userId', async (req, res) => {
  const id = req.params.userId;
  const body = req.body;

  // body will have userId. But it will be ignored by the findByIdAndUpdate function
  // because this field is not present in the user model
  try {
    const ALLOWED_UPDATES = ['firstName', 'lastName', 'age', 'gender', 'photoUrl', 'about', 'skills'];
    const illegalUpdatedFields = Object.keys(body).filter(key => !ALLOWED_UPDATES.includes(key));

    if (illegalUpdatedFields.length > 0) {
      throw new Error(`Invalid updates: ${illegalUpdatedFields.join(', ')}`);
    }

    if (body?.skills?.length > 10) {
      throw new Error('Skills cannot be more than 10');
    }

    const user = await userModel.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
      lean: true,
      runValidators: true,
    });

    await res.send({message: 'User updated successfully', user});
  } catch (err) {
    res.status(400).send(err.message);
  }
});

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