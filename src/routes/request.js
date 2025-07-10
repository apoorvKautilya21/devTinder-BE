const express = require('express');
const { userAuth } = require('../middleware/auth');
const ConnectionRequest = require('../models/connectionRequest');
const userModel = require('../models/user');
const requestRouter = express.Router();

requestRouter.post('/request/send/:status/:userId', userAuth, async (req, res) => {
  try {
    const fromUser = req.user;
    const status = req.params.status;
    const toUserId = req.params.userId;

    if (!['interested', 'ignored'].includes(status)) throw new Error('Invalid status');
    if (!toUserId) throw new Error('User ID is required');

    // Below code will be handled in Schema.pre('save')
    // if (fromUser._id.toString() === toUserId) throw new Error('You cannot send a connection request to yourself');

    const toUser = await userModel.findById(toUserId);

    if (!toUser) throw new Error('User not found');

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        {
          fromUserId: fromUser._id,
          toUserId,
        },
        {
          fromUserId: toUserId,
          toUserId: fromUser._id,
        }
      ]
    });

    if (existingRequest) {
      throw new Error('You have already sent a connection request to this user'); 
    }

    const connection = new ConnectionRequest({
      fromUserId: fromUser._id,
      toUserId,
      status,
    });

    const data = await connection.save();

    res.json({message: 'Connection request sent successfully', data}); 
  } catch (err) {
    res.status(400).send({message: err.message});
  }
});

module.exports = requestRouter;