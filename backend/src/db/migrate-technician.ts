import 'dotenv/config';
import { client, ensureDatabaseReady } from '../config/db';

async function migrate() {
  console.log('🔄 Checking and applying full database schema migration...');
  try {
    await ensureDatabaseReady(true);
    const columns = await client<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inbox_messages'
      ORDER BY ordinal_position;
    `;
    console.log(
      '✅ Current inbox_messages columns:',
      columns.map((c) => `${c.column_name} (${c.data_type})`).join(', ')
    );
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
