import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(currentDir, 'uploads')));
app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'FoodHub API' }));
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
try {
  await connectDB();
  app.listen(port, () => console.log(`FoodHub API listening on http://localhost:${port}`));
} catch (error) {
  console.error(`Could not start FoodHub API: ${error.message}`);
  process.exit(1);
}
