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
const utilityService_1 = __importDefault(require("../../service/system/utilityService"));
const responseHelper_1 = __importDefault(require("../../helpers/system/responseHelper"));
const errorHandler_1 = require("../../helpers/system/errorHandler");
const validations_1 = require("../../validations");
const system_1 = require("../../constants/controllers/system");
class UtilityController {
    // POST /api/utility/test-email - Test email sending functionality
    testEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = validations_1.testEmailSchema.parse(req.body);
                const result = yield utilityService_1.default.processTestEmail(validatedData);
                return responseHelper_1.default.success(res, result.message, {
                    to: result.to,
                    type: result.type,
                    sentAt: result.sentAt,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, system_1.SYSTEM_ERROR_MESSAGES.TEST_EMAIL_FAILED);
            }
        });
    }
    // POST /api/utility/resend-email - Resend verification or reset email for existing user
    resendEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validatedData = validations_1.resendEmailSchema.parse(req.body);
                const result = yield utilityService_1.default.processResendEmail(validatedData);
                return responseHelper_1.default.success(res, result.message, {
                    email: result.email,
                    type: result.type,
                    sentAt: result.sentAt,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Resend email");
            }
        });
    }
    // GET /api/utility/email-status - Check email service status
    checkEmailStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const emailStatus = yield utilityService_1.default.getEmailStatus();
                return responseHelper_1.default.success(res, system_1.SYSTEM_SUCCESS_MESSAGES.EMAIL_STATUS_SUCCESS, emailStatus);
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Email status check");
            }
        });
    }
    // GET /api/utility/health - Health check endpoint
    healthCheck(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const healthStatus = yield utilityService_1.default.getHealthCheck();
                const statusCode = healthStatus.status === "healthy" ? 200 : 503;
                const message = healthStatus.status === "healthy"
                    ? system_1.SYSTEM_SUCCESS_MESSAGES.HEALTH_CHECK_SUCCESS
                    : "Service is unhealthy";
                return responseHelper_1.default.success(res, message, healthStatus, statusCode);
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Health check");
            }
        });
    }
    // GET /api/utility/info - Get service information
    getServiceInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceInfo = utilityService_1.default.getServiceInfo();
                return responseHelper_1.default.success(res, system_1.SYSTEM_SUCCESS_MESSAGES.SERVICE_INFO_SUCCESS, serviceInfo);
            }
            catch (error) {
                (0, errorHandler_1.handleError)(res, error, "Service info");
            }
        });
    }
}
exports.default = new UtilityController();
