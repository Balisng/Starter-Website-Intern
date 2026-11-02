import 'dotenv/config';

const rawJwtSecret = process.env.JWT_SECRET?.trim();

if (!rawJwtSecret) {
  console.error('❌ FATAL ERROR: JWT_SECRET environment variable is not defined in .env');
  console.error('   Server cannot start without a valid JWT_SECRET.');
  process.exit(1);
}

export const JWT_SECRET: string = rawJwtSecret;
export const PORT = process.env.PORT || 5000;

// Parse comma-separated CLIENT_URL whitelist (e.g., "http://localhost:3000,https://my-app.vercel.app")
const rawClientUrls = process.env.CLIENT_URL || 'http://localhost:3000';
const configuredOrigins = rawClientUrls
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Include Vercel deployment URLs when running on Vercel
if (process.env.VERCEL_URL) {
  configuredOrigins.push(`https://${process.env.VERCEL_URL}`);
}
if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  configuredOrigins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
}

export const ALLOWED_ORIGINS = Array.from(new Set(configuredOrigins));

