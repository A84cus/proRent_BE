"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailTransporter = exports.emailConfig = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const environment_1 = require("../environment");
// Ethereal Email configuration for testing (alternative to Mailtrap)
const etherealConfig = {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    user: 'ethereal.user@ethereal.email', // Replace with actual ethereal credentials
    pass: 'ethereal.pass', // Replace with actual ethereal credentials
    from: environment_1.THIRD_PARTY_CONFIG.SMTP_FROM || 'noreply@prorent.com'
};
exports.emailConfig = environment_1.THIRD_PARTY_CONFIG.USE_GMAIL
    ? {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for port 465, false for 587
        user: environment_1.THIRD_PARTY_CONFIG.SMTP_FROM || '',
        pass: environment_1.THIRD_PARTY_CONFIG.GMAIL_PASS || '',
        from: environment_1.THIRD_PARTY_CONFIG.SMTP_FROM || '',
        frontendUrl: environment_1.THIRD_PARTY_CONFIG.BASE_FE_URL || environment_1.THIRD_PARTY_CONFIG.BASE_FE_URL_ALT || 'http://localhost:3000'
    }
    : {
        host: environment_1.THIRD_PARTY_CONFIG.SMTP_HOST || '',
        port: parseInt(environment_1.THIRD_PARTY_CONFIG.SMTP_PORT || '2525'),
        secure: false,
        user: environment_1.THIRD_PARTY_CONFIG.SMTP_USER || '',
        pass: environment_1.THIRD_PARTY_CONFIG.SMTP_PASS || '',
        from: environment_1.THIRD_PARTY_CONFIG.SMTP_FROM || '',
        frontendUrl: environment_1.THIRD_PARTY_CONFIG.BASE_FE_URL || environment_1.THIRD_PARTY_CONFIG.BASE_FE_URL_ALT || 'http://localhost:3000'
    };
const createEmailTransporter = () => {
    let transporter;
    if (environment_1.THIRD_PARTY_CONFIG.USE_GMAIL) {
        transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: exports.emailConfig.user,
                pass: exports.emailConfig.pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    else {
        transporter = nodemailer_1.default.createTransport({
            host: exports.emailConfig.host,
            port: exports.emailConfig.port,
            secure: exports.emailConfig.secure,
            auth: {
                user: exports.emailConfig.user,
                pass: exports.emailConfig.pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    return transporter;
};
exports.createEmailTransporter = createEmailTransporter;
exports.default = exports.emailConfig;
