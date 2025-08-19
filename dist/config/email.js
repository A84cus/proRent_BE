"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailTransporter = exports.emailConfig = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_1 = require("../config/index");
<<<<<<< HEAD
exports.emailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true untuk port 465, false untuk 587
    user: index_1.SMTP_FROM || '',
    pass: index_1.GMAIL_PASS || '',
    from: index_1.SMTP_FROM || '',
    frontendUrl: index_1.BASE_FE_URL || 'http://localhost:3000'
};
// : {
//      host: SMTP_HOST || '',
//      port: parseInt(SMTP_PORT || '2525'),
//      secure: false,
//      user: SMTP_USER || '',
//      pass: SMTP_PASS || '',
//      from: SMTP_FROM || '',
//      frontendUrl: BASE_FE_URL || 'http://localhost:3000'
//   };
const createEmailTransporter = () => {
    return nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: exports.emailConfig.user,
            pass: exports.emailConfig.pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
=======
exports.emailConfig = index_1.USE_GMAIL
    ? {
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for 587
        user: index_1.SMTP_FROM || "",
        pass: index_1.GMAIL_PASS || "",
        from: index_1.SMTP_FROM || "",
        frontendUrl: index_1.BASE_FE_URL || "http://localhost:3000",
    }
    : {
        host: index_1.SMTP_HOST || "",
        port: parseInt(index_1.SMTP_PORT || "2525"),
        secure: false,
        user: index_1.SMTP_USER || "",
        pass: index_1.SMTP_PASS || "",
        from: index_1.SMTP_FROM || "",
        frontendUrl: index_1.BASE_FE_URL || "http://localhost:3000",
    };
const createEmailTransporter = () => {
    let transporter;
    if (index_1.USE_GMAIL) {
        transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: exports.emailConfig.user,
                pass: exports.emailConfig.pass,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }
    else {
        transporter = nodemailer_1.default.createTransport({
            host: exports.emailConfig.host,
            port: exports.emailConfig.port,
            secure: exports.emailConfig.secure,
            auth: {
                user: exports.emailConfig.user,
                pass: exports.emailConfig.pass,
            },
        });
    }
    return transporter;
>>>>>>> origin/feature-1
};
exports.createEmailTransporter = createEmailTransporter;
// transporter = nodemailer.createTransport({
//    host: emailConfig.host,
//    port: emailConfig.port,
//    secure: emailConfig.secure,
//    auth: {
//       user: emailConfig.user,
//       pass: emailConfig.pass
//    }
// });
