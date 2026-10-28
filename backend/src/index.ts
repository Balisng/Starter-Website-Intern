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
    origin: [CLIENT_URL, 'http://localhost:5173'], // Vite default and configured ports
    credentials: true, // Allow cookies to pass across origins
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbConnected = await testDbConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// Main API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Repair Service Backend running at http://localhost:${PORT}`);
  console.log(`📡 Health Check available at http://localhost:${PORT}/api/health`);
  console.log(`🍪 Cookie-based Auth enabled with CORS origin: ${CLIENT_URL}`);
});

export default app;
