import mongoose from "mongoose";

const connectDB = async () => {

  try {

    await mongoose.connect(process.env.MONGO);
    console.log("mongodb connect sucessfully");
  } 
  catch (err) {
    console.error(err);
  }
}
export default connectDB

