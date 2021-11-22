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
const Dataloader = require('dataloader');
const loaders = require('./dataloader');

async function startApolloServer(typeDefs, resolvers) {
  dotEnv.config();

  connection();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({req, connection}) => {
      const contextObj = {};

      if (req) {
        await verifyUser(req);
        contextObj.email = req.email;
        contextObj.loggedInUserId = req.loggedInUserId;
      }

      contextObj.loaders = {
        user: new Dataloader((keys) => loaders.user.batchUsers(keys)),
      };

      return contextObj;
    },
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault({footer: false})
        : ApolloServerPluginLandingPageLocalDefault({footer: false}),
    ],
    formatError: (e) => {
      consol.log(e);
      return {
        message: e.message,
      };
    },
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
