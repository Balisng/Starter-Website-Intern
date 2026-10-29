import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { testDbConnection } from './config/db';
import { errorHandler } from './middlewares/error.middleware';
import apiRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Middlewares
app.use(
  cors({
    origin: true, // Allow request's origin dynamically (supports localhost, vercel preview, and custom domains)
    credentials: true, // Allow cookies to pass across origins
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route (handles both /api/health and /health depending on Vercel rewrite prefix)
const healthCheck = async (_req: Request, res: Response) => {
  const dbConnected = await testDbConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
};
app.get('/api/health', healthCheck);
app.get('/health', healthCheck);

// Main API Routes (mount on both /api and root fallback for Vercel rewrites)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server locally or on standalone host (Skip in Vercel Serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Repair Service Backend running at http://localhost:${PORT}`);
    console.log(`📡 Health Check available at http://localhost:${PORT}/api/health`);
    console.log(`🍪 Cookie-based Auth enabled with CORS`);
  });
}

export default app;
