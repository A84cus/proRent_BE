"use strict";
// src/controllers/report/dashboardReportController.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardReportController = void 0;
const reportDashboardService_1 = require("../../service/report/reportDashboardService");
const paymentProofController_1 = require("../reservationController/paymentProofController");
const dashboardReportController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // --- 1. Extract ownerId ---
        const ownerId = (0, paymentProofController_1.getUserIdFromRequest)(req);
        if (!ownerId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // --- 2. Pass raw query to service ---
        // Zod will handle parsing and validation
        const rawInput = {
            ownerId,
            filters: req.query,
            options: req.query
        };
        // --- 3. Call service ---
        const report = yield (0, reportDashboardService_1.getOwnerDashboardReport)(rawInput.ownerId, rawInput.filters, rawInput.options);
        // --- 4. Send response ---
        res.status(200).json(report);
    }
    catch (error) {
        console.error('Error in dashboardReportController:', error);
        // --- Handle known error types ---
        if (error.message.includes('Invalid ID') || error.message.includes('Invalid element')) {
            res.status(400).json({
                error: 'Invalid request',
                details: error.message
            });
            return;
        }
        if (error.message.includes('not found or not owned') || error.message.includes('Access denied')) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        // --- Unknown error ---
        res.status(500).json({
            error: 'Failed to generate dashboard report',
            details: error.message
        });
    }
});
exports.dashboardReportController = dashboardReportController;
