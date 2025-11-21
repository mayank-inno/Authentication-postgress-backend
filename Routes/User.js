import { Router } from "express";
import { createUser, changePassword, login, verifyOtp, sendOTP } from "../Controllers/User.js";

const userRouter = Router();

// for creating and login user.
userRouter.post("/login",login);
userRouter.post("/sign-up",createUser);

// for reseting password.
userRouter.post("/send-otp",sendOTP);
userRouter.post("/verify-otp",verifyOtp);
userRouter.post("/change-password",changePassword);

export default userRouter;