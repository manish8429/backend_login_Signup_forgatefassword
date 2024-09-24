import User from "../Model/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendMail from "../middlwere/Sendmail.js";
import { createTransport } from "nodemailer";
import dotenv from'dotenv'

dotenv.config();
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.Email,
      pass: process.env.PASSWORD,
    },
  });


export const signupuser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }
    const hasspass = await bcrypt.hash(password, 10);

    user = {
      name,
      email,
      password: hasspass,
    };
    const otp = Math.floor(100000 + Math.random() * 900000);

    const activationToken = jwt.sign(
      {
        user,
        otp,
      },

      process.env.SECRET_KEY,

      {
        expiresIn: "1h",
      }
    );
    const data = {
      user,
      otp,
    };
    await sendMail(email, "Manish Prajapati", data);
    return res.json({ msg: "Otp Send successfully", activationToken });
  } catch (error) {
    console.log(error.message);
  }
};

export const verifyuser = async (req, res) => {
  const { activationToken, otp } = req.body;

  try {
    if (!activationToken) {
      return res.status(400).json({ msg: "Please provide activation token" });
    }
    const verifyuser = await jwt.verify(
      activationToken,
      process.env.SECRET_KEY
    );
    if (!verifyuser) {
      return res.status(400).json({ msg: "Invalid activation token" });
    }
    if (verifyuser.otp.toString() !== otp.toString()) {
      return res.status(400).json({ msg: "Invalid otp" });
    }
    await User.create({
      name: verifyuser.user.name,
      email: verifyuser.user.email,
      password: verifyuser.user.password,
    });
    return res.json({ message: "User Registered Successfully" });
  } catch (error) {
    console.log(error.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }
    const token = await jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
      expiresIn: "10d",
    });
    return res.json({ msg: "Login successfully", token });
  } catch (error) {
    console.log(error.message);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" }); 
    }

    // Generate token
    const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
      expiresIn: "1d",  
    });

    // Update the user with the verify token
    const setusertoken = await User.findByIdAndUpdate(
      { _id: user._id },
      { verifytoken: token },
      { new: true }
    );

    // If token update is successful, send the reset email
    if (setusertoken) {
      const forgetMailOption = {
        from: process.env.Email,
        to: email,
        subject: "Forget Password",
        text: `This link is valid only for 2 minutes: http://localhost:5173/resetpassword/${user.id}/${token}`,
      };

      transport.sendMail(forgetMailOption, (error, info) => {
        if (error) {
          return res.status(500).json({ msg: "Error sending email" });
        } else {
          return res.status(200).json({ msg: "Reset link sent to your email" });
        }
      });
    } else {
      return res.status(500).json({ msg: "Error updating user with token" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};



// Controller for updating the password
export const updatepassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  // console.log(req.params);
  // console.log(req)

  try {
    // Find the user by ID and verify token
    const validUser = await User.findOne({ _id: id, verifytoken: token });

    if (!validUser) {
      return res.status(401).json({ msg: "User not found or token invalid" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    validUser.password = hashedPassword;
    await validUser.save();

    // Send a success response
    return res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
 

