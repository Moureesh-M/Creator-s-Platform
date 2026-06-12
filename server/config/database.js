import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.NODE_ENV === 'test'
    ? process.env.MONGODB_URI_TEST
    : process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MongoDB connection string is missing');
  }

  await mongoose.connect(mongoURI);
};

export default connectDB;
