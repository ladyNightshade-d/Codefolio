import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create a new pool instance using the connection string from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If you are using SSL (e.g. on a hosted DB), uncomment below:
  // ssl: { rejectUnauthorized: false }
});

// Helper to log queries in development
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    // console.log('Database connected');
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
