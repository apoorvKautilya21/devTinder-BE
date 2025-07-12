const express = require('express');
const { userAuth } = require('../middleware/auth');
const ConnectionRequest = require('../models/connectionRequest');
const Users = require('../models/user');

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

    const data = requests.map(request => {
      if (request.fromUserId._id.toString() === loggedInUser?._id.toString()) {
        return {
          user: request.toUserId,
          status: request.status,
        }
      }

      return {
        user: request.fromUserId,
        status: request.status,
      };
    });

    res.json({data});
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
        };
      }
      return {
        user: connection.fromUserId,
      };
    });

    res.json({data});
  } catch (err) {
    res.status(400).json({message: err.message});
  }
});

userRouter.get('/user/feed', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = Math.min(limit, 100);
    const skip = (page - 1) * limit;

    const requests = await ConnectionRequest.find({
      $or: [
        {
          fromUserId: loggedInUser?._id,
        },
        {
          toUserId: loggedInUser?._id,
        }
      ]
    }).select('fromUserId toUserId');

    const hiddenUsersList = requests.map(request => {
      if (request.fromUserId._id.toString() === loggedInUser?._id.toString()) {
        return request.toUserId;
      }
      
      return request.fromUserId;
    });

    hiddenUsersList.push(loggedInUser?._id);

    const data = await Users.find({
      _id: {
        $nin: hiddenUsersList,
      }
    }).skip(skip).limit(limit);

    res.json(data);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
})

module.exports = userRouter;
