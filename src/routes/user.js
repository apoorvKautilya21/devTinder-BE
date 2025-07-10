const express = require('express');
const { userAuth } = require('../middleware/auth');
const ConnectionRequest = require('../models/connectionRequest');

const userRouter = express.Router();

const USER_POPULATE_FIELDS = 'firstName lastName about skills';

userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const requests = await ConnectionRequest
      .find({
        toUserId: loggedInUser?._id,
        status: 'interested',
      })
      .populate('fromUserId', USER_POPULATE_FIELDS)
      .populate('toUserId', USER_POPULATE_FIELDS);

    res.json({data: requests});
  } catch (err) {
    res.status(400).json({message: err.message});
  }
})

userRouter.get('/user/connections', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest
      .find({
        $or: [
          {
            fromUserId: loggedInUser?._id,
            status: 'accepted',
          },
          {
            toUserId: loggedInUser?._id,
            status: 'accepted',
          }
        ]
      })
      .populate('fromUserId', USER_POPULATE_FIELDS)
      .populate('toUserId', USER_POPULATE_FIELDS);

    const data = connections.map(connection => {
      if (connection.fromUserId._id.toString() === loggedInUser?._id.toString()) {
        return {
          user: connection.toUserId,
        }
      }
      return {
        user: connection.fromUserId,
      }
    });

    res.json({data});
  } catch (err) {
    res.status(400).json({message: err.message});
  }
})

module.exports = userRouter;
