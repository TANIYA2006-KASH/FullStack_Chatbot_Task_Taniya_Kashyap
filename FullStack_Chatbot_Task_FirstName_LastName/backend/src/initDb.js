// Creates the table (and optionally demo data):  npm run db:init  |  npm run db:seed
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../database');

try {
  await pool.query(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'));
  console.log('✔ Schema ready');
  if (process.argv.includes('--seed')) {
    await pool.query(fs.readFileSync(path.join(dir, 'seed.sql'), 'utf8'));
    console.log('✔ Demo data inserted');
  }
} catch (err) {
  console.error('✖ Database setup failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
