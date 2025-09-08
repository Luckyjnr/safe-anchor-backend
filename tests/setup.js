const mongoose = require('mongoose');

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/safe-anchor-test';

// Setup MongoDB connection for testing
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Test MongoDB connected');
  } catch (error) {
    console.error('Test MongoDB connection error:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

// Clean up after all tests
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('Test MongoDB disconnected');
  }
});
