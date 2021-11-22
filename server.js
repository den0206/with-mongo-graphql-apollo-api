const express = require('express');
const cors = require('cors');
const dotEnv = require('dotenv');
const {ApolloServer, gql} = require('apollo-server-express');
const {
  ApolloServerPluginLandingPageProductionDefault,
  ApolloServerPluginLandingPageLocalDefault,
} = require('apollo-server-core');

const {connection} = require('./database/util');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const {verifyUser} = require('./helper/context');

async function startApolloServer(typeDefs, resolvers) {
  dotEnv.config();

  connection();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({req}) => {
      await verifyUser(req);
      return {
        email: req.email,
        loggedInUserId: req.loggedInUserId,
      };
    },
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault({footer: false})
        : ApolloServerPluginLandingPageLocalDefault({footer: false}),
    ],
  });
  const app = express();
  app.use(cors());
  app.use(express.json());
  await server.start();
  server.applyMiddleware({app, path: '/graphql'});

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}${server.graphqlPath}`);
  });
}

startApolloServer(typeDefs, resolvers);
