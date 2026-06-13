import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvs = ['JWT_SECRET'];
const missing = requiredEnvs.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('\n❌ Missing required environment variables: ' + missing.join(', '));
  console.error('Please create a .env file with the following keys: MONGO_URI, JWT_SECRET, PORT (optional)');
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
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean)
    : ['http://localhost:3000'];

  const corsOptions = {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
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

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    });
  }

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