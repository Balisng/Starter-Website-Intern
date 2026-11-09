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

let schemaReady = false;
let schemaInitPromise: Promise<void> | null = null;

/**
 * ตรวจสอบและอัปเดตคอลัมน์ที่จำเป็นแบบอัตโนมัติ (Idempotent Auto-Migration)
 * แยกแต่ละคำสั่งเป็น Top-level SQL ใน try/catch แยกกัน เพื่อไม่ให้คำสั่งใดคำสั่งหนึ่งขัดจังหวะคำสั่งถัดไป
 */
export async function ensureDatabaseReady(force: boolean = false): Promise<void> {
  if (schemaReady && !force) {
    return;
  }

  if (!schemaInitPromise || force) {
    schemaInitPromise = (async () => {
      const ddlStatements = [
        `ALTER TYPE "repair_status" ADD VALUE IF NOT EXISTS 'in_progress'`,
        `ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "technician_id" integer REFERENCES "users"("u_id") ON DELETE SET NULL`,
        `ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "final_price" integer`,
        `ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "completed_at" timestamp`,
        `ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "promo_code" varchar(50)`,
        `ALTER TABLE "inbox_messages" ADD COLUMN IF NOT EXISTS "discount_percent" integer DEFAULT 0`,
        `SELECT setval(pg_get_serial_sequence('inbox_messages', 'cm_id'), COALESCE((SELECT MAX(cm_id) FROM inbox_messages), 0) + 1, false)`,
      ];

      let allColumnsAdded = true;
      for (const stmt of ddlStatements) {
        try {
          await client.unsafe(stmt);
        } catch (err) {
          console.warn(`⚠️ Auto-schema statement warning (${stmt.slice(0, 50)}...):`, err);
          if (stmt.includes('ADD COLUMN')) {
            allColumnsAdded = false;
          }
        }
      }

      if (allColumnsAdded) {
        schemaReady = true;
      } else {
        schemaInitPromise = null;
      }
    })();
  }

  return schemaInitPromise;
}

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
