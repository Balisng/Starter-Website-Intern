import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

const rawConnectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgresql://postgres:postgres@localhost:5432/repair_service_db';

// Strip libpq-specific query params (e.g., channel_binding) that Postgres.js would otherwise send as server GUCs
const connectionString = rawConnectionString
  .replace(/([?&])channel_binding=[^&]*(&|$)/g, (_match, prefix: string, suffix: string) =>
    suffix === '&' ? prefix : ''
  )
  .replace(/[?&]$/, '');

// Create Postgres.js client with serverless pooling & SSL support
export const client = postgres(connectionString, {
  max: process.env.VERCEL ? 5 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
  ssl: connectionString.includes('localhost') ? false : 'require',
});

// Create Drizzle ORM instance with typed schema
export const db = drizzle(client, { schema });

let schemaInitPromise: Promise<void> | null = null;

/**
 * ตรวจสอบและอัปเดตคอลัมน์ที่จำเป็นแบบอัตโนมัติ (Idempotent Auto-Migration)
 * ป้องกันปัญหาฐานข้อมูลบน Local หรือ Vercel ขาดคอลัมน์ใหม่ เช่น promo_code, discount_percent, final_price
 */
export function ensureDatabaseReady(): Promise<void> {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      try {
        await client`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_type t
              JOIN pg_enum e ON t.oid = e.enumtypid
              WHERE t.typname = 'repair_status' AND e.enumlabel = 'in_progress'
            ) THEN
              ALTER TYPE "repair_status" ADD VALUE 'in_progress';
            END IF;
          EXCEPTION
            WHEN duplicate_object THEN NULL;
          END $$;
        `;

        await client`
          ALTER TABLE "inbox_messages"
            ADD COLUMN IF NOT EXISTS "technician_id" integer REFERENCES "users"("u_id") ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS "final_price" integer,
            ADD COLUMN IF NOT EXISTS "completed_at" timestamp,
            ADD COLUMN IF NOT EXISTS "promo_code" varchar(50),
            ADD COLUMN IF NOT EXISTS "discount_percent" integer DEFAULT 0;
        `;

        // ซิงค์ลำดับ Auto-increment Sequence ให้ตรงกับข้อมูลล่าสุดเสมอ ป้องกัน Primary Key ชนกัน
        await client`
          SELECT setval(
            pg_get_serial_sequence('inbox_messages', 'cm_id'),
            COALESCE((SELECT MAX(cm_id) FROM inbox_messages), 0) + 1,
            false
          );
        `;
      } catch (err) {
        console.warn('⚠️ Auto-schema check warning:', err);
        schemaInitPromise = null;
      }
    })();
  }
  return schemaInitPromise;
}

// Trigger schema check in background on startup
void ensureDatabaseReady();

// Helper function to test DB connectivity
export async function testDbConnection(): Promise<boolean> {
  try {
    await ensureDatabaseReady();
    await client`SELECT 1`;
    console.log('✅ Connected to PostgreSQL database successfully.');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error);
    return false;
  }
}
