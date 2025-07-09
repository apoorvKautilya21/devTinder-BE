const validator = require('validator');

const validateSignup = (data) => {
  if (!data?.firstName || !data?.lastName || !data?.emailId || !data?.password) {
    throw new Error('Please provide all the required fields');
  }

  if (!validator.isEmail(data?.emailId)) {
    throw new Error('Invalid email');
  }

  if (!validator.isStrongPassword(data?.password)) {
    throw new Error('Password is not strong enough');
  }
};

const validateProfileEdit = (data) => {
  const fieldsThatCanBeUpdated = ['firstName', 'lastName', 'skills', 'about', 'photoUrl', 'age', 'gender'];

  const isUpdateValid = Object.keys(data || {}).every(field => fieldsThatCanBeUpdated.includes(field));

  return isUpdateValid;
}

module.exports = {
  validateSignup,
  validateProfileEdit,
};