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

export const sendVerificationEmail = async (
  to: string,
  code: string,
  name?: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2>Welcome to DidSecPlus, ${name || "User"}!</h2>
      <p>Your account has been created. Please verify your email to activate your account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8;">
          ${code}
        </span>
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <small>DidSecPlus &copy; 2025</small>
    </div>
  `;
  console.log("7c2");

  await transporter.sendMail({
    from: `"DidSecPlus" <${process.env.NODE_MAILER_USER}>`,
    to,
    subject: "Verify Your Email - DidSecPlus",
    html,
  });
};

export const sendEmail = async (data: {
  to: string;
  subject: string;
  code: string;
  name?: string;
}) => {
  const { to, subject, code, name } = data;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2>${name || "User"}!</h2>
      <p>Your password reset token is</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8;">
          ${code}
        </span>
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <small>DidSecPlus &copy; 2025</small>
    </div>
  `;

  await transporter.sendMail({
    from: `"DidSecPlus" <${process.env.NODE_MAILER_USER}>`,
    to,
    subject,
    html,
  });
};
