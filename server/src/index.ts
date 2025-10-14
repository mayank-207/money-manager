import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import Database from './config/database';
import { initializeDatabase } from './database/init';

// Initialize database connection
const db = Database.getInstance();

const app: Application = express();
app.use(cors());
app.use(express.json());

// GraphQL
async function startApollo() {
  const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    context: ({ req }) => ({ req }) 
  });
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


