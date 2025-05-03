const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Seeds the database with initial data for testing
 */
const seedDatabase = async () => {
  try {
    // Check if we already have users
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('Seeding database with initial data...');
      
      // Create a test user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        institution: 'Test University',
        grade: 'University - Junior',
        subjects: ['Computer Science', 'Mathematics'],
        learningStyle: 'Visual',
        examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
      
      await testUser.save();
      console.log('Test user created successfully');
      
      // Add more seed data here if needed
      
      console.log('Database seeding completed');
    } else {
      console.log('Database already has data, skipping seed');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = seedDatabase;