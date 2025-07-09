const express = require('express');
const { userAuth } = require('../middleware/auth');
const { validateProfileEdit } = require('../utils/validation');
const bcrypt = require('bcrypt');

const profileRouter = express.Router();

profileRouter.get('/profile/view', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send({message: err.message});
  }
});

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
  try {
    const user = req.user;

    const isUpdateValid = validateProfileEdit(req.body);
    if (!isUpdateValid) throw new Error('Invalid update');

    req.body?.forEach?.(field => {
      user[field] = req.body[field];
    });

    await user.save();

    res.send({message: 'Profile updated successfully'});
  } catch (err) {
    res.status(400).send({message: err.message});
  }
});

profileRouter.patch('/profile/password', userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword) throw new Error('Please provide current password');
    if (!newPassword) throw new Error('Please provide new password');

    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) throw new Error('Invalid current password');

    if (currentPassword === newPassword) throw new Error('New password cannot be the same as current password');

    const isStrongPassword = validator.isStrongPassword(newPassword);
    if (!isStrongPassword) throw new Error('New password is not strong enough');

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.password = newPasswordHash;

    await user.save();

    res.send({message: 'Password updated successfully'});
  } catch(err) {
    res.status(400).send({message: err.message});
  }
});

module.exports = profileRouter;