const express = require('express');
const { userAuth } = require('../middleware/auth');
const requestRouter = express.Router();

requestRouter.post('/sendConnectionRequest', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send({message: `${user.firstName} sent you a connection request`});
  } catch (err) {
    res.status(400).send({message: err.message});
  }
});

module.exports = requestRouter;