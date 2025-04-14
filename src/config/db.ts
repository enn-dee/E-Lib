import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
   try {
      mongoose.connection.on("connected", () => {
         console.log("======Connected to DB======");
      });

      mongoose.connection.on("error", (error) => {
         console.log("Error in connecting to db: ", error);
      });

      await mongoose.connect(config.database_url as string);
   } catch (error) {
      console.log("Error connecting to db: ", error);

      process.exit(1);
   }
};

export default connectDB;
