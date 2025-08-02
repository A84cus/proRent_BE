"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailTransporter = exports.emailConfig = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.emailConfig = {
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT || "2525"),
    secure: false, // true for 465, false for other ports
    user: process.env.SMTP_USER || "5afc643591b70e",
    pass: process.env.SMTP_PASS || "c3ffe7e5804c14",
    from: process.env.SMTP_FROM || "proprerent@gmail.com",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
const createEmailTransporter = () => {
    return nodemailer_1.default.createTransport({
        host: exports.emailConfig.host,
        port: exports.emailConfig.port,
        secure: exports.emailConfig.secure,
        auth: {
            user: exports.emailConfig.user,
            pass: exports.emailConfig.pass,
        },
    });
};
exports.createEmailTransporter = createEmailTransporter;
