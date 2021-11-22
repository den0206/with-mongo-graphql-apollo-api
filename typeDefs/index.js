const userTypeDef = require('./user');
const taskTypeDef = require('./task');
const {gql} = require('apollo-server-core');

const typeDefs = gql`
  scalar Date
  type Query {
    _: String
  }

  type Mutation {
    _: String
  }

  type Subscription {
    _: String
  }
`;

module.exports = [typeDefs, userTypeDef, taskTypeDef];
