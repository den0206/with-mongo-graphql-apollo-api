const {skip} = require('graphql-resolvers');
const Task = require('../../database/models/task');
const {isValidObjectId} = require('../../database/util');

module.exports.isAuthenticated = (_, __, context) => {
  if (!context.email) {
    throw new Error('Acess Denied!');
  }

  return skip;
};

module.exports.isTaskOwner = async (_, args, context) => {
  try {
    if (!isValidObjectId(args.id)) {
      throw new Error('Invalid Task Id');
    }
    const task = await Task.findById(args.id);
    if (!task) {
      throw new Error('Task not found');
    } else if (task.user.toString() !== context.loggedInUserId) {
      throw new Error('the User cant Access');
    }

    return skip;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
