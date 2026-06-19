import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvs = ['MONGO_URI', 'JWT_SECRET'];
const missing = requiredEnvs.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('\n❌ Missing required environment variables: ' + missing.join(', '));
  console.error('Please create a .env file with: MONGO_URI, JWT_SECRET, PORT (optional)');
  process.exit(1);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('\n❌ JWT_SECRET must be at least 32 characters long for production safety.');
  process.exit(1);
}

if (!process.env.MONGO_URI.startsWith('mongodb')) {
  console.error('\n❌ MONGO_URI must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://');
  process.exit(1);
}

const app = express();
let dbConnected = false;

async function startServer() {
  try {
    await connectDB();
    dbConnected = true;
  } catch (err) {
    console.warn('⚠️ MongoDB not available — running without database. Some features will be limited.');
  }

  app.disable('x-powered-by');

  // Security headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Body parsing with size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173', 'https://blogora-amber.vercel.app'];

  const corsOptions = {
    origin(origin, callback) {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow same-origin requests
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In production with single-service deployment, the frontend is same-origin
      // so this only matters for external API consumers
      const errorMsg = `CORS blocked for origin: ${origin}`;
      if (process.env.NODE_ENV === 'production') {
        console.warn(errorMsg);
        return callback(null, false);
      }
      callback(new Error(errorMsg));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));

  // Stats endpoint for homepage
  app.get('/api/stats', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.json({ totalPosts: 0, totalAuthors: 0 });
      }
      const Post = (await import('./models/Post.js')).default;
      const User = (await import('./models/User.js')).default;
      const [totalPosts, totalAuthors] = await Promise.all([
        Post.countDocuments(),
        User.countDocuments(),
      ]);
      res.json({ totalPosts, totalAuthors });
    } catch {
      res.json({ totalPosts: 0, totalAuthors: 0 });
    }
  });

  app.use('/api/posts', postRoutes);
  app.use('/api', commentRoutes);
  app.use('/api', likeRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api', newsletterRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const PORT = Number(process.env.PORT) || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});