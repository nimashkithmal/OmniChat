import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI
    if (!mongoURI) {
      throw new Error("MongoDB URI not found in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB Connected:");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};