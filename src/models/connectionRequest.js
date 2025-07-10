const mongoose = require('mongoose');

/*
What is ref: 'User'?
It's like a foreign key in SQL databases, but for MongoDB. It tells Mongoose:
This field contains an ObjectId that points to a document in the User collection
You can populate this field to get the full User document instead of just the ID

const request = await ConnectionRequestModel.findOne()
  .populate('fromUserId')
  .populate('toUserId');

console.log(request);
Output:
{
  _id: ObjectId('...'),
  fromUserId: {                    // Full User object
    _id: ObjectId('507f1f77bcf86cd799439011'),
    firstName: 'John',
    lastName: 'Doe',
    emailId: 'john@example.com',
    // ... other user fields
  },
  toUserId: {                      // Full User object
    _id: ObjectId('507f1f77bcf86cd799439012'),
    firstName: 'Jane',
    lastName: 'Smith',
    emailId: 'jane@example.com',
    // ... other user fields
  },
  status: 'interested'
}

*/

const connectionRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // 👈 Points to User collection
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // 👈 Points to User collection
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['ignored', 'interested', 'accepted', 'rejected'],
      message: '{VALUE} is not a valid status',
    },
  },
}, {
  timestamps: true,
});

connectionRequestSchema.index({
  fromUserId: 1,
  toUserId: 1,
});

connectionRequestSchema.pre('save', function(next) {
  const connectionRequest = this;

  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error('You cannot send a connection request to yourself');
  }

  next();
})

const ConnectionRequestModel = mongoose.model('ConnectionRequest', connectionRequestSchema);

// Print indexes - use collection.getIndexes() or listIndexes()
// ConnectionRequestModel.collection.getIndexes((err, indexes) => {
//   if (err) {
//     console.log('Error getting indexes:', err);
//   } else {
//     console.log('ConnectionRequest indexes:', indexes);
//   }
// });

module.exports = ConnectionRequestModel;