const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string
    // In production, use the environment variable from .env file
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodrunner', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;