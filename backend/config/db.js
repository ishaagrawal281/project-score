const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
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
