import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { testDbConnection } from './config/db';
import { ALLOWED_ORIGINS, PORT } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import apiRoutes from './routes';

const app = express();

// Middlewares: CORS with explicit origin whitelist from CLIENT_URL and Vercel domains
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests or non-browser tools (no Origin header)
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, '');
      if (
        ALLOWED_ORIGINS.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
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

// Main API Routes (รองรับทั้งผ่าน /api และกรณี Serverless rewrite ตัด prefix)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server locally or on standalone host (Skip in Vercel Serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Repair Service Backend running at http://localhost:${PORT}`);
    console.log(`📡 Health Check available at http://localhost:${PORT}/api/health`);
    console.log(`🔒 CORS Whitelist Origins: ${ALLOWED_ORIGINS.join(', ')}`);
  });
}

export default app;
