const express = require('express');
const cors = require('cors');
const path = require('path');
const errorMiddleware = require('./middleware/errorMiddleware');
require('dotenv').config();

// Route files
const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');
const documentRoutes = require('./routes/documentRoutes');
const shareRoutes = require('./routes/shareRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin);
    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically (for local fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routers
app.use('/api', authRoutes); // Exposes: POST /api/signup, POST /api/login, GET /api/profile
app.use('/api/folders', folderRoutes); // Exposes: POST /api/folders, GET /api/folders, PUT /api/folders/:id, DELETE /api/folders/:id
app.use('/api/documents', documentRoutes); // Exposes: POST /api/documents/upload, GET /api/documents, DELETE /api/documents/:id, PUT /api/documents/:id/move
app.use('/api/share', shareRoutes); // Exposes: POST /api/share/:documentId, GET /api/share/:token

// Root check route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Document Vault API is running.'
  });
});

// Health check route with database connectivity
app.get('/health', async (req, res) => {
  try {
    const prisma = require('./config/db');
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      message: 'Service and database are operational',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      message: 'Service or database is unavailable',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Centralized Error Middleware (Must be registered last)
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`Document Vault Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
