const {tasks, users} = require('../constants');
const uuid = require('uuid');

module.exports = {
  /// Root Query
  Query: {
    tasks: () => tasks,
    task: (_, args) => {
      return tasks.find((task) => task.id == args.id);
    },
  },

  Mutation: {
    createTask: (_, args) => {
      const task = {...args.input, id: uuid.v4()};
      tasks.push(task);

      return task;
    },
  },

  /// Field Level resolvers

  Task: {
    user: (parent) => users.find((user) => user.id == parent.userid),
  },
};
