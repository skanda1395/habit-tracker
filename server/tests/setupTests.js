import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST);
    console.log(`Connected to MongoDB test database:`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB test database:', error);
    process.exit(1);
  }
}, 10000);

afterEach(async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    console.log('Dropped test database after each test.');
  }
});

afterAll(async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    console.log('Disconnected from test database.');
  }
});