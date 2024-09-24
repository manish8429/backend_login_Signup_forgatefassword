import mongoose from "mongoose";

const UserSchem = new mongoose.Schema({
    name:{
        type:String,
        required:true

    },
    email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      otp: {
        type: String, // OTP can be stored as a string
        required: false, // Optional since it's temporary
      },
      otpExpires: {
        type: Date, // Stores when the OTP expires
        required: false, // Optional since it's temporary
      },

      verifytoken: {
        type: String, 
      }
}) 

const User = mongoose.model("Manish", UserSchem);

export default User;