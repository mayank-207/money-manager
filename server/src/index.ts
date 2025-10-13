import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import Database from './config/database';
import { initializeDatabase } from './database/init';
import authRouter from './routes/auth';
import participantsRouter from './routes/participants';
import groupsRouter from './routes/groups';
import expensesRouter from './routes/expenses';
import reportsRouter from './routes/reports';
import analyticsRouter from './routes/analytics';

// Initialize database connection
const db = Database.getInstance();

const app: Application = express();
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
  server.applyMiddleware({ app: app as any, path: '/graphql' });
}

async function startServer() {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    // Start Apollo GraphQL server
    await startApollo();
    
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${port}/graphql`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


