import 'dotenv/config';
import { client } from '../config/db';

async function migrate() {
  console.log('🔄 Checking and applying technician_id column migration...');
  try {
    await client`
      ALTER TABLE "inbox_messages" 
      ADD COLUMN IF NOT EXISTS "technician_id" integer REFERENCES "users"("u_id") ON DELETE SET NULL;
    `;
    console.log('✅ Column "technician_id" added to "inbox_messages" successfully (or already exists)!');

    const columns = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'inbox_messages';
    `;
    console.log('📋 Current inbox_messages columns:', columns.map((c: any) => `${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
