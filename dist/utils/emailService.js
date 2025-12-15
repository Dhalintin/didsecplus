"use strict";
// import "dotenv/config";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.sendVerificationEmail = void 0;
// require("dotenv").config();
// // import { Resend } from "resend";
// import nodemailer from "nodemailer";
// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.NODE_MAILER_USER,
// //     pass: process.env.NODE_MAILER_PASS,
// //   },
// // });
// // const transporter = nodemailer.createTransport({
// //   host: "smtp.resend.com",
// //   port: 465,
// //   secure: false,
// //   auth: {
// //     user: "resend",
// //     pass: process.env.RESEND_API_KEY,
// //   },
// // });
// const transporter = nodemailer.createTransport({
//   host: "smtp.resend.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "resend",
//     pass: process.env.RESEND_API_KEY,
//   },
// });
// transporter
//   .verify()
//   .then(() => {
//     console.log("✅ Email server is ready to take messages");
//   })
//   .catch((err: any) => {
//     console.error("❌ Error with email server configuration:", err);
//   });
// export const sendVerificationEmail = async (
//   to: string,
//   code: string,
//   name?: string
// ) => {
//   console.log(process.env.RESEND_API_KEY);
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
//       <h2>Welcome to DidSecPlus, ${name || "User"}!</h2>
//       <p>Your account has been created. Please verify your email to activate your account.</p>
//       <div style="text-align: center; margin: 30px 0;">
//         <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8;">
//           ${code}
//         </span>
//       </div>
//       <p>This code expires in <strong>10 minutes</strong>.</p>
//       <p>If you didn't request this, please ignore this email.</p>
//       <hr>
//       <small>DidSecPlus &copy; 2025</small>
//     </div>
//   `;
//   await transporter.sendMail({
//     from: `"DidSecPlus" <${process.env.NODE_MAILER_USER}>`,
//     to,
//     subject: "Verify Your Email - DidSecPlus",
//     html,
//   });
// };
// export const sendEmail = async (data: {
//   to: string;
//   subject: string;
//   code: string;
//   name?: string;
// }) => {
//   const { to, subject, code, name } = data;
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
//       <h2>${name || "User"}!</h2>
//       <p>Your password reset token is</p>
//       <div style="text-align: center; margin: 30px 0;">
//         <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8;">
//           ${code}
//         </span>
//       </div>
//       <p>This code expires in <strong>10 minutes</strong>.</p>
//       <p>If you didn't request this, please ignore this email.</p>
//       <hr>
//       <small>DidSecPlus &copy; 2025</small>
//     </div>
//   `;
//   await transporter.sendMail({
//     from: `"DidSecPlus" <${process.env.NODE_MAILER_USER}>`,
//     to,
//     subject,
//     html,
//   });
// };
// // export const sendVerificationEmail = async (
// //   to: string,
// //   code: string,
// //   name?: string
// // ) => {
// //   const html = `
// //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
// //       <h2>Welcome to DidSecPlus, ${name || "User"}!</h2>
// //       <p>Your account has been created. Please verify your email to activate your account.</p>
// //       <div style="text-align: center; margin: 30px 0;">
// //         <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8;">
// //           ${code}
// //         </span>
// //       </div>
// //       <p>This code expires in <strong>10 minutes</strong>.</p>
// //       <p>If you didn't request this, please ignore this email.</p>
// //       <hr>
// //       <small>DidSecPlus &copy; 2025</small>
// //     </div>
// //   `;
// //   await resend.emails.send({
// //     from: "onboarding@resend.dev",
// //     to: "uchexdhalitin@gmail.com",
// //     subject: "Hello World",
// //     html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
// //   });
// // };
// // export const sendEmail = async (data: {
// //   to: string;
// //   subject: string;
// //   code: string;
// //   name?: string;
// // }) => {
// //   const { to, subject, code, name } = data;
// //   const html = `
// //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
// //       <h2>${name || "User"}!</h2>
// //       <p>Your password reset token is</p>
// //       <div style="text-align: center; margin: 30px 0;">
// //         <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8;">
// //           ${code}
// //         </span>
// //       </div>
// //       <p>This code expires in <strong>10 minutes</strong>.</p>
// //       <p>If you didn't request this, please ignore this email.</p>
// //       <hr>
// //       <small>DidSecPlus &copy; 2025</small>
// //     </div>
// //   `;
// //   await resend.emails.send({
// //     from: "onboarding@resend.dev",
// //     to: "uchexdhalitin@gmail.com",
// //     subject: "Hello World",
// //     html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
// //   });
// // };
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendVerificationEmail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.NODE_MAILER_USER,
                pass: process.env.NODE_MAILER_PASS,
            },
        });
        const mailOptions = {
            from: `Didsecplus <${process.env.NODE_MAILER_USER}>`,
            to: data.email,
            subject: data.subject,
            html: data.html,
        };
        const info = yield transport.sendMail(mailOptions);
        console.log(`Message sent: ${info.messageId}`);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendEmail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.NODE_MAILER_USER,
                pass: process.env.NODE_MAILER_PASS,
            },
        });
        const mailOptions = {
            from: `Didsecplus <${process.env.NODE_MAILER_USER}>`,
            to: data.email,
            subject: data.subject,
            html: data.html,
        };
        const info = yield transport.sendMail(mailOptions);
        console.log(`Message sent: ${info.messageId}`);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
});
exports.sendEmail = sendEmail;
