import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ravegraph',
  user: process.env.DB_USER || 'ravegraph',
  password: process.env.DB_PASSWORD || 'ravegraph_dev',
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
