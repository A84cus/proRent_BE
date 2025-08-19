"use strict";
// Disposable Mail Integration for ProRent
// Note: Disposable Mail is for receiving emails, not sending them
// We'll use it as a destination for testing emails
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDisposableEmail = exports.generateDisposableEmail = exports.createEmailTransporter = exports.emailConfig = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const environment_1 = require("../environment");
// Configuration for using free SMTP services with disposable email destinations
const freeEmailConfigs = {
    // Gmail SMTP (free tier)
    gmail: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        service: 'gmail'
    },
    // Outlook/Hotmail SMTP (free)
    outlook: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        service: 'hotmail'
    },
    // Yahoo SMTP (free)
    yahoo: {
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        service: 'yahoo'
    },
    // Ethereal Email (testing)
    ethereal: {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false
    }
};
// Disposable email domains for testing
const disposableEmailDomains = [
    '@disposablemail.com',
    '@tempmail.com',
    '@10minutemail.com',
    '@mailinator.com',
    '@guerrillamail.com'
];
exports.emailConfig = environment_1.THIRD_PARTY_CONFIG.USE_GMAIL === 'true'
    ? {
        host: freeEmailConfigs.gmail.host,
        port: freeEmailConfigs.gmail.port,
        secure: freeEmailConfigs.gmail.secure,
        user: environment_1.THIRD_PARTY_CONFIG.SMTP_USER || '',
        pass: environment_1.THIRD_PARTY_CONFIG.SMTP_PASS || '',
        from: environment_1.THIRD_PARTY_CONFIG.SMTP_FROM || '',
        frontendUrl: environment_1.THIRD_PARTY_CONFIG.BASE_FE_URL || 'http://localhost:3000'
    }
    : {
        host: environment_1.THIRD_PARTY_CONFIG.SMTP_HOST || '',
        port: parseInt(environment_1.THIRD_PARTY_CONFIG.SMTP_PORT || '587'),
        secure: false,
        user: environment_1.THIRD_PARTY_CONFIG.SMTP_USER || '',
        pass: environment_1.THIRD_PARTY_CONFIG.SMTP_PASS || '',
        from: environment_1.THIRD_PARTY_CONFIG.SMTP_FROM || '',
        frontendUrl: environment_1.THIRD_PARTY_CONFIG.BASE_FE_URL || 'http://localhost:3000'
    };
const createEmailTransporter = () => {
    let transporter;
    if (environment_1.THIRD_PARTY_CONFIG.USE_GMAIL === 'true') {
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
// Utility function to generate disposable email for testing
const generateDisposableEmail = (prefix = 'prorent-test') => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const domain = disposableEmailDomains[Math.floor(Math.random() * disposableEmailDomains.length)];
    return `${prefix}-${randomId}${domain}`;
};
exports.generateDisposableEmail = generateDisposableEmail;
// Utility function to check if email is disposable
const isDisposableEmail = (email) => {
    return disposableEmailDomains.some(domain => email.toLowerCase().includes(domain));
};
exports.isDisposableEmail = isDisposableEmail;
exports.default = exports.emailConfig;
