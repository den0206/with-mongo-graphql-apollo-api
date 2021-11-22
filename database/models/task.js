const {timeStamp} = require('console');
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    name: {type: String, require: true},
    completed: {type: Boolean, require: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  },
  {timestamps: true}
);

module.exports = mongoose.model('Task', taskSchema);
