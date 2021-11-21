const {timeStamp} = require('console');
const mongoose = require('mongoose');
const {User} = require('../../resolvers/user');

const taskSchema = new mongoose.Schema({
  name: {type: String, require: true},
  completed: {type: Boolean, require: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});

module.exports = mongoose.model('User', userSchema);
