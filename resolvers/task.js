const Task = require('../database/models/task');
const User = require('../database/models/user');
const {isAuthenticated, isTaskOwner} = require('./middleware');
const {combineResolvers} = require('graphql-resolvers');
const {encodeBase64, decodeToBase64} = require('../helper/context');

module.exports = {
  /// Root Query
  Query: {
    tasks: combineResolvers(
      isAuthenticated,
      async (_, {cursor, limit = 10}, context) => {
        try {
          console.log(limit);
          const query = {user: context.loggedInUserId};
          if (cursor) {
            query['_id'] = {
              /// 複合化
              $lt: decodeToBase64(cursor),
            };
          }

          let tasks = await Task.find(query)
            .sort({_id: -1})
            .limit(limit + 1);
          const hasNextPage = tasks.length > limit;
          tasks = hasNextPage ? tasks.slice(0, -1) : tasks;

          /// 暗号化
          const nextPageCursor = hasNextPage
            ? encodeBase64(tasks[tasks.length - 1].id)
            : null;

          const pageFeed = {
            taskFeed: tasks,
            pageInfo: {
              nextPageCursor: nextPageCursor,
              hasNextPage: hasNextPage,
            },
          };

          return pageFeed;
        } catch (e) {
          console.log(e);
          throw e;
        }
      }
    ),

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
          await User.updateOne(
            {_id: context.loggedInUserId},
            {$pull: {tasks: deletedTask.id}}
          );

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
    user: async (parent, __, context) => {
      try {
        // const user = await User.findById(parent.user);
        const user = await context.loaders.user.load(parent.user.toString());
        return user;
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
  },
};
