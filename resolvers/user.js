const User = require('../database/models/user');
const Task = require('../database/models/task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {combineResolvers} = require('graphql-resolvers');
const {isAuthenticated} = require('./middleware');

module.exports = {
  /// Root Query
  Query: {
    // users: () => users,
    user: combineResolvers(isAuthenticated, async (_, args, context) => {
      try {
        const user = await User.findOne({email: context.email});
        if (!user) {
          throw new Error('User Not found');
        }
        return user;
      } catch (e) {
        console.log(e);
        throw e;
      }
    }),
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
        const secret = process.env.JWT_SECRET_KEY || 'mysecretkey';

        const token = jwt.sign({email: user.email}, secret, {expiresIn: '1d'});
        return {token};
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
  },

  User: {
    tasks: async (parent) => {
      try {
        const tasks = await Task.find({user: parent.id});
        return tasks;
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
  },
};
