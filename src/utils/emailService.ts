// import "dotenv/config";

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
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (data: {
  email: string;
  subject: string;
  html: string;
}) => {
  try {
    await resend.emails.send({
      from: "Didsecplus <onboarding@resend.dev>", // Default sender (or verify your domain later)
      to: [data.email],
      subject: data.subject,
      html: data.html,
    });
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send email");
  }
};

export const sendEmail = async (data: {
  email: string;
  subject: string;
  html: string;
}) => {
  try {
    await resend.emails.send({
      from: "Didsecplus <onboarding@resend.dev>",
      to: [data.email],
      subject: data.subject,
      html: data.html,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// export const sendVerificationEmail = async (data: any) => {
//   try {
//     const transport = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.NODE_MAILER_USER,
//         pass: process.env.NODE_MAILER_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `Didsecplus <${process.env.NODE_MAILER_USER}>`,
//       to: data.email,
//       subject: data.subject,
//       html: data.html,
//     };

//     const info = await transport.sendMail(mailOptions);
//     console.log(`Message sent: ${info.messageId}`);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Error sending email");
//   }
// };

// export const sendEmail = async (data: any) => {
//   try {
//     const transport = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.NODE_MAILER_USER,
//         pass: process.env.NODE_MAILER_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `Didsecplus <${process.env.NODE_MAILER_USER}>`,
//       to: data.email,
//       subject: data.subject,
//       html: data.html,
//     };

//     const info = await transport.sendMail(mailOptions);
//     console.log(`Message sent: ${info.messageId}`);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Error sending email");
//   }
// };
