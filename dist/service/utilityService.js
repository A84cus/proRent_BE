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
const emailTestingService_1 = __importDefault(require("./emailTestingService"));
const emailResendService_1 = __importDefault(require("./emailResendService"));
const systemHealthService_1 = __importDefault(require("./systemHealthService"));
const logger_1 = __importDefault(require("../utils/logger"));
class UtilityService {
    // Process test email
    processTestEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { to, type } = data;
            const message = yield emailTestingService_1.default.processTestEmail(data);
            logger_1.default.info(`Test email sent to ${to} - Type: ${type}`);
            return {
                to,
                type,
                sentAt: new Date().toISOString(),
                message,
            };
        });
    }
    // Process resend email
    processResendEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, type } = data;
            const message = yield emailResendService_1.default.processResendEmail(data);
            logger_1.default.info(`Email resent to ${email} - Type: ${type}`);
            return {
                email,
                type,
                sentAt: new Date().toISOString(),
                message,
            };
        });
    }
    // Get email status
    getEmailStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            return systemHealthService_1.default.getEmailStatus();
        });
    }
    // Get health check
    getHealthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            return systemHealthService_1.default.getHealthStatus();
        });
    }
    // Get service info
    getServiceInfo() {
        return systemHealthService_1.default.getServiceInfo();
    }
}
exports.default = new UtilityService();
