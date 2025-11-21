import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    }
});

export const sendEmail = async (receivers_mail, subject, message) => {
    const confirmation = await transporter.sendMail({
        from: process.env.SENDER_MAIL,
        to: receivers_mail,
        subject:subject,
        text:message,
    });
    return confirmation;
}