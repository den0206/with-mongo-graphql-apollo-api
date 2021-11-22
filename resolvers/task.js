const {tasks, users} = require('../constants');
const uuid = require('uuid');
const Task = require('../database/models/task');
const User = require('../database/models/user');
const {isAuthenticated, isTaskOwner} = require('./middleware');
const {combineResolvers} = require('graphql-resolvers');

module.exports = {
  /// Root Query
  Query: {
    tasks: combineResolvers(isAuthenticated, async (_, __, context) => {
      try {
        const tasks = await Task.find({user: context.loggedInUserId});
        return tasks;
      } catch (e) {
        console.log(e);
        throw e;
      }
    }),

    task: combineResolvers(isAuthenticated, isTaskOwner, async (_, args) => {
      try {
        const task = await Task.findById(args.id);
        return task;
      } catch (e) {
        console.log(e);
        throw e;
      }
    }),
  },

  Mutation: {
    createTask: combineResolvers(isAuthenticated, async (_, args, context) => {
      try {
        const user = await User.findOne({email: context.email});
        const task = Task({...args.input, user: user.id});

        const result = await task.save();
        user.tasks.push(result.id);
        await user.save();

        return result;
      } catch (e) {
        console.log(e);
        throw e;
      }
    }),

    updateTask: combineResolvers(
      isAuthenticated,
      isTaskOwner,
      async (_, args) => {
        try {
          const newTask = await Task.findByIdAndUpdate(
            args.id,
            {...args.input},
            {new: true}
          );
          return newTask;
        } catch (e) {
          console.log(e);
          throw e;
        }
      }
    ),

    deleteTask: combineResolvers(
      isAuthenticated,
      isTaskOwner,
      async (_, args, context) => {
        try {
          const deletedTask = await Task.findByIdAndDelete(args.id);
          return deletedTask;
        } catch (e) {
          console.log(e);
          throw e;
        }
      }
    ),
  },

  /// Field Level resolvers

  Task: {
    user: async (parent) => {
      try {
        const user = await User.findById(parent.user);
        return user;
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
  },
};
