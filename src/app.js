const express = require('express');
const connectDB = require('./config/database');
const userModel = require('./models/user');
const app = express();
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

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
