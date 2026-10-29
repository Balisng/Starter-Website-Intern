import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/repair_service_db';

// Create Postgres.js client with serverless pooling & SSL support
export const client = postgres(connectionString, {
  max: process.env.VERCEL ? 1 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: connectionString.includes('localhost') ? false : 'require',
});

// Create Drizzle ORM instance with typed schema
export const db = drizzle(client, { schema });

// Helper function to test DB connectivity
export async function testDbConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    console.log('✅ Connected to PostgreSQL database successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error);
    return false;
  }
}
