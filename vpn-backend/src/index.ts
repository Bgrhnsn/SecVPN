import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import vpnRoutes from './routes/vpn';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vpn', vpnRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('VPN API is running');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vpn_app')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server after connecting to database
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

export default app; 