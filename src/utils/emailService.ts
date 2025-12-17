import "dotenv/config";

require("dotenv").config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAILER_USER,
    pass: process.env.NODE_MAILER_PASS,
  },
});

export const sendVerificationEmail = async (data: {
  email: string;
  subject: string;
  html: string;
}) => {
  try {
    await transporter.sendMail({
      from: `"DidSecPlus" <${process.env.NODE_MAILER_USER}>`,
      to: data.email,
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
    // await resend.emails.send({
    //   from: "Didsecplus <didsecplus@n-reply.com>",
    //   to: [data.email],
    //   subject: data.subject,
    //   html: data.html,
    // });
    await transporter.sendMail({
      from: `"DidSecPlus" <${process.env.NODE_MAILER_USER}>`,
      to: data.email,
      subject: data.subject,
      html: data.html,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
