// server.js
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import authRoutes from './routes/authRoutes.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';
import connectDB from './config/db.js';

// --- CORRECTED: Get __dirname equivalent for ES Modules ---
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Correct way to use path.dirname
// --- END CORRECTION ---

// Correct dotenv configuration
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
connectDB();

// Middlewares
app.use(express.json());

// --- CRUCIAL CORS CONFIGURATION UPDATE ---
const corsOptions = {
  origin: 'http://localhost:3000', // Set your frontend's exact origin
  credentials: true,               // Allow cookies/auth headers to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed request headers
};
app.use(cors(corsOptions)); // Apply the specific CORS options
// --- END CRUCIAL CORS CONFIGURATION UPDATE ---

// Routes
app.use('/api/posts', postRoutes);
app.use('/api', commentRoutes);
app.use('/api/auth', authRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});