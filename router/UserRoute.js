import express from "express";
import { forgotPassword, login, signupuser, updatepassword, verifyuser } from "../controller/UserController.js";



const router = express.Router();
router.post('/signup', signupuser)
router.post('/verify', verifyuser)
router.post('/login',login )
router.post('/forgetpassword', forgotPassword)
router.post('/updatepassword/:id/:token', updatepassword)


export default router;