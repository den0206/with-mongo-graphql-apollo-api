const {tasks, users} = require('../constants');
const User = require('../database/models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {env} = require('process');

module.exports = {
  /// Root Query
  Query: {
    users: () => users,
    user: (_, args) => {
      return users.find((user) => user.id == args.id);
    },
  },

  Mutation: {
    signup: async (_, args) => {
      try {
        const user = await User.findOne({email: args.input.email});
        if (user) {
          throw new Error('Email already un use');
        }
        const hashedPasword = await bcrypt.hash(args.input.password, 12);
        const newUser = new User({...args.input, password: hashedPasword});
        console.log(newUser);
        const result = newUser.save();
        return result;
      } catch (e) {
        console.log(e);
        throw e;
      }
    },

    login: async (_, args) => {
      try {
        const user = await User.findOne({email: args.input.email});
        if (!user) {
          throw new Error('User is not Exist');
        }
        const isPasswordValid = await bcrypt.compare(
          args.input.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('password is not match');
        }
        const secKey = process.env.JWT_SECRET_KEY || '';
        const token = jwt.sign({email: user.email}, secKey, {expiresIn: '1d'});
        return {token};
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
  },

  User: {
    tasks: (parent) => {
      /// return array
      return tasks.filter((task) => task.userid == parent.id);
    },
  },
};
