const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedDatabase = require('./src/utils/seedDatabase');
require('dotenv').config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const studyRoutes = require('./src/routes/study.routes');
const quizRoutes = require('./src/routes/quiz.routes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/quiz', quizRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Connect to MongoDB
// Connect to MongoDB
const connectDB = async () => {
  try {
    // Create an in-memory MongoDB instance
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    console.log(`Using in-memory MongoDB at: ${mongoUri}`);
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    
    console.log('MongoDB In-Memory Server Connected...');
    
    // Seed some initial data
    await seedDatabase();
    
    return true;
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    console.log('Continuing without database connection. Some features will not work.');
    // Continue running the app without database
    return false;
  }
};

// Connect to database
connectDB();

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
// Use a different port if 5000 is in use
const alternativePort = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use, trying alternative port ${alternativePort}`);
    app.listen(alternativePort, () => {
      console.log(`Server running on alternative port ${alternativePort}`);
    });
  } else {
    console.error('Server error:', err);
  }
});