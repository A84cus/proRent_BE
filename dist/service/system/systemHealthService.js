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
const emailService_1 = __importDefault(require("../email/emailService"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const prisma_1 = __importDefault(require("../../prisma"));
class SystemHealthService {
    // Check database connection
    checkDatabaseConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.user.count();
                return true;
            }
            catch (error) {
                logger_1.default.error('Database connection failed:', error);
                return false;
            }
        });
    }
    // Check email service connection
    checkEmailConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield emailService_1.default.testConnection();
            }
            catch (error) {
                logger_1.default.error('Email service connection failed:', error);
                return false;
            }
        });
    }
    // Get comprehensive health status
    getHealthStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const [databaseStatus, emailStatus] = yield Promise.all([
                this.checkDatabaseConnection(),
                this.checkEmailConnection()
            ]);
            const isHealthy = databaseStatus && emailStatus;
            return {
                status: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                services: {
                    database: databaseStatus ? 'connected' : 'disconnected',
                    email: emailStatus ? 'connected' : 'disconnected'
                },
                uptime: process.uptime(),
                version: process.env.npm_package_version || '1.0.0'
            };
        });
    }
    // Get email service status
    getEmailStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const isConnected = yield this.checkEmailConnection();
            return {
                emailServiceStatus: isConnected ? 'connected' : 'disconnected',
                timestamp: new Date().toISOString(),
                smtpHost: process.env.SMTP_HOST || 'not configured',
                smtpPort: process.env.SMTP_PORT || 'not configured',
                smtpUser: process.env.SMTP_USER ? 'configured' : 'not configured'
            };
        });
    }
    // Get service information
    getServiceInfo() {
        return {
            service: 'ProRent Backend API',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            features: {
                authentication: 'enabled',
                fileUpload: 'enabled',
                emailService: 'enabled',
                utilities: 'enabled'
            },
            endpoints: {
                auth: '/api/auth',
                upload: '/api/upload',
                utility: '/api/utility'
            }
        };
    }
}
exports.default = new SystemHealthService();
