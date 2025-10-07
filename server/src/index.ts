import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import authRouter from './routes/auth';
import participantsRouter from './routes/participants';
import groupsRouter from './routes/groups';
import expensesRouter from './routes/expenses';
import reportsRouter from './routes/reports';
import analyticsRouter from './routes/analytics';

const app = express();
app.use(cors());
app.use(express.json());

// REST endpoints
app.use('/api/auth', authRouter);
app.use('/api/participants', participantsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/analytics', analyticsRouter);

// GraphQL
async function startApollo() {
  const server = new ApolloServer({ typeDefs, resolvers, context: ({ req }) => ({ user: (req as any).user }) });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
}

startApollo();

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});


