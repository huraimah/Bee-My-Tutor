const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedDatabase = require('./src/utils/seedDatabase');
const multer = require('multer');
require('dotenv').config();

// Initialize Firebase Admin
require('./src/utils/firebase-admin');

// Initialize Express
const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  "https://firebasestorage.googleapis.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory for temporary file storage
const uploadDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    console.log(`Using in-memory MongoDB at: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB In-Memory Server Connected...');
    
    await seedDatabase();
    return true;
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    console.log('Continuing without database connection. Some features will not work.');
    return false;
  }
};

// Connect to database
connectDB();

// Define PORT and start server
const PORT = process.env.PORT || 5002;
const alternativePort = 5005;

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