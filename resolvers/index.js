const userResolver = require('./user');
const taskResolver = require('./task');
const {GraphQLDateTime} = require('graphql-iso-date');

const customDateScalrResolver = {
  Date: GraphQLDateTime,
};

module.exports = [userResolver, taskResolver, customDateScalrResolver];
