const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).send({message: 'Please login to access this resource'});

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodeData?._id;
    const user = await userModel.findById(userId);

    if (!user) throw new Error('User not found');

    req.user = user;

    next();
  } catch (err) {
    console.log(err);
    res.status(400).send({message: err.message});
  }
}

module.exports = {
  userAuth,
};