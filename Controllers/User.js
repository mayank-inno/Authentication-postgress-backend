import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sendEmail } from "../Config/email.js";

// regex for testing
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email Password both required',
        })
    }
    else {
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email"
            })
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password Formate"
            })
        }
        const hasedPassword = await bcrypt.hash(password, 10);
        try {
            await User.create({
                email,
                password: hasedPassword,
            })
            return res.status(201).json({
                success: true,
                message: "User Created Successfully"
            })
        }
        catch (err) {
            console.log(err);
            if (err.name == "SequelizeUniqueConstraintError") {
                return res.status(400).json({
                    success: false,
                    message: "Email Already Exist"
                })
            }
            else {
                return res.status(500).json({
                    success: false,
                    err: 'Server Error Please try again',
                })
            }
        }
    }
}

export const sendOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email required",
        })
    }
    else {
        const existingUser = await User.findOne({ where: { email } });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Email Not Found",
            })
        }
        else {
            const otp = Math.floor(100000 + Math.random() * 900000);
            try {
                const confirmation = await sendEmail(email, "Reset Password OTP", `Your One Time Reset Password OTP is:${otp}`);
                if (confirmation) {
                    // otp expiry time 10 mins
                    const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);
                    existingUser.resetPasswordOTP = otp;
                    existingUser.resetPasswordOTPExpiresAt = otpExpiry;
                    await existingUser.save();
                    return res.status(200).json({
                        success: true,
                        message: "OTP Sent Successfully",
                    })
                }
                else {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to Send Email"
                    })
                }
            }
            catch (err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: "Server Error",
                })
            }
        }
    }
}

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!otp || !email) {
        return res.status(400).json({
            success: false,
            message: "OTP and Email Both Required",
        })
    }
    else {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "NO Such User with this email"
            })
        }
        else {
            if (new Date() > new Date(user.resetPasswordOTPExpiresAt)) {
                return res.status(400).json({
                    success: false,
                    message: "OTP Expired",
                })
            }
            else {
                if (user.resetPasswordOTP == otp) {
                    res.status(200).json({
                        success: true,
                        message: "OTP Verified"
                    })
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: "Wrong OTP",
                    })
                }
            }

        }
    }
}

export const changePassword = async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email Required",
        })
    }
    else if (!password) {
        return res.status(400).json({
            success: false,
            message: "Password Required",
        })
    }
    else {
        try {
            const existingUser = await User.findOne({ where: { email } });
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: "Email not registered"
                })
            }
            else {
                if (passwordRegex.test(password)) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    existingUser.password = hashedPassword;
                    await existingUser.save();
                    return res.status(200).json({
                        success: true,
                        message: "Password Changed Successfully",
                    })
                }
                else {
                    return res.status(400).json({
                        success: false,
                        message: "Wrong Password Format",
                    })
                }
            }
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Server Error",
            })
        }
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Both Email Password Required',
        })
    }
    else {
        const userExist = await User.findOne({ where: { email } });
        if (!userExist) {
            return res.status(404).json({
                success: false,
                message: "Email Not Registered"
            })
        }
        else {
            const isMatch = await bcrypt.compare(password, userExist.dataValues.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Password"
                })
            }
            else {
                try {
                    const token = jwt.sign({ id: userExist.dataValues.id }, process.env.JWT_SECRET, {
                        expiresIn: "7d",
                    })
                    res.cookie("token", token, {
                        httpOnly: false,
                        secure: process.env.Environment == "production",
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                        sameSite: "Lax",
                    })
                    return res.status(200).json({
                        success: true,
                        message: "Login Successfull"
                    })
                }
                catch (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message: "Server Error Please Try again",
                    })
                }
            }
        }
    }
}