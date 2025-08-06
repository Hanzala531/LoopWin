import mongoose from "mongoose";
import { DB_name } from "../constants.js";

const connectDB = async () => {
  try {
    // await mongoose.connect('mongodb://localhost:27017')
    const connectionInstance = await mongoose.connect(
       process.env.MONGODB_URI
    );
    console.log("MongoDB connected!");
    console.log(
      `\n MongoDB conected !! Db Host : ${connectionInstance.connection.host} \n MongoDB conected !! Db Name : ${connectionInstance.connection.name} \n`
    );
  } catch (error) {
    console.log("Mongo DB connection error: " + error);
    process.exit(1);
  }
};

export default connectDB;
