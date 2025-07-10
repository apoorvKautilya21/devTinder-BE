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

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    // requestId === Apoorv(fromUserId) -> Rohit(toUserId)
    // loggedInUser => toUserId
    // connReq.status === interested
    const { status, requestId } = req.params || {};

    if (!['accepted', 'rejected'].includes(status)) throw new Error('Invalid status');

    const connReq = await ConnectionRequest.findOne({_id: requestId});

    if (!connReq) throw new Error('Request not found');

    if (connReq.toUserId.toString() !== loggedInUser._id.toString()) throw new Error('You are not authorized to review this request');

    if (connReq.status !== 'interested') throw new Error('You can only review interested requests');

    connReq.status = status;

    const data = await connReq.save();

    res.json({message: 'Connection request ' + status + ' successfully', data});
  } catch (err) {
    res.status(400).send({message: err.message});
  }
});

module.exports = requestRouter;