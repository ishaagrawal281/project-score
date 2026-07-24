const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log("DB URL inside db.js:", connectionString);

// Parse connection string manually to ensure pg doesn't fallback to OS defaults
let poolConfig = { connectionString };
try {
  const url = new URL(connectionString);
  poolConfig = {
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: url.port || 5432,
    database: url.pathname.replace('/', ''),
    ssl: { rejectUnauthorized: false }
  };
} catch (e) {
  console.log("Error parsing DB URL", e);
}

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

// Connect on startup to verify connectivity
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to PostgreSQL database via Prisma and pg adapter.');
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL database via Prisma:', err.message);
  });

module.exports = prisma;
