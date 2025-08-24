import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
