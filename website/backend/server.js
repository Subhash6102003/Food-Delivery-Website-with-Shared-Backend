const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Mount API routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/restaurants', require('./src/routes/restaurantRoutes'));
app.use('/api/menu', require('./src/routes/menuRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));

// Serve static files for the frontend
app.use(express.static(path.join(__dirname, '../')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API Documentation
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Food Delivery Consumer API',
    endpoints: [
      { method: 'GET', path: '/api/restaurants', description: 'Get all restaurants' },
      { method: 'GET', path: '/api/restaurants/:id', description: 'Get a single restaurant' },
      { method: 'GET', path: '/api/restaurants/top-rated', description: 'Get top rated restaurants' },
      { method: 'GET', path: '/api/menu', description: 'Get all menu items' },
      { method: 'GET', path: '/api/menu/:id', description: 'Get a single menu item' },
      { method: 'GET', path: '/api/menu/restaurant/:restaurantId', description: 'Get menu for a restaurant' },
      { method: 'POST', path: '/api/auth/register', description: 'Register a new user' },
      { method: 'POST', path: '/api/auth/login', description: 'Login user' },
      { method: 'POST', path: '/api/orders', description: 'Create a new order' },
      { method: 'GET', path: '/api/orders', description: 'Get all orders for the logged in user' }
    ]
  });
});

// Serve the main index file for any other route
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../', 'index.html'));
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Define PORT
const PORT = process.env.PORT || 5001; // Using 5001 to avoid conflict with website1's backend

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});