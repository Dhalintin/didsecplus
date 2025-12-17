"use strict";
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
require("dotenv/config");
require("dotenv").config();
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODE_MAILER_USER,
        pass: process.env.NODE_MAILER_PASS,
    },
});
const sendVerificationEmail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield transporter.sendMail({
            from: `"DidSecPlus" <${process.env.NODE_MAILER_USER}>`,
            to: data.email,
            subject: data.subject,
            html: data.html,
        });
        console.log("Verification email sent successfully");
    }
    catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send email");
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendEmail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // await resend.emails.send({
        //   from: "Didsecplus <didsecplus@n-reply.com>",
        //   to: [data.email],
        //   subject: data.subject,
        //   html: data.html,
        // });
        yield transporter.sendMail({
            from: `"DidSecPlus" <${process.env.NODE_MAILER_USER}>`,
            to: data.email,
            subject: data.subject,
            html: data.html,
        });
        console.log("Email sent successfully");
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
});
exports.sendEmail = sendEmail;
