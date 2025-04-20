import mongoose from 'mongoose';

const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
    process.exit(1);
  }
};

export default connectDB;
