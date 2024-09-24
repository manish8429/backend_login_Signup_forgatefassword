import mongoose from "mongoose";

export const Dbconnection = async (req, res) => {
  const url = process.env.MONGO_URL;
  try {
    mongoose.connect(url).then(() => {
      console.log("DataBase Connected Sussfully ! 😎😎");
    });
  } catch (error) {
    console.log(error);
  }
};
