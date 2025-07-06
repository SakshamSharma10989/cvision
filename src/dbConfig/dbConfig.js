import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL); // ensure you await the connection
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    connection.on("error", (err) => {
      console.log("MongoDB connection error", err);
    });
  } catch (error) {
    console.log("Connection error:");
    console.log(error);
  }
}
