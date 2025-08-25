"use strict";
// src/controllers/report/excelController.ts
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
exports.exportDashboardExcel = void 0;
const reportCustomController_1 = require("./reportCustomController"); // Reuse it!
const paymentProofController_1 = require("../reservationController/paymentProofController");
const excelReport_1 = require("../../templates/report/excelReport");
const exportDashboardExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = (0, paymentProofController_1.getUserIdFromRequest)(req);
        if (!ownerId) {
            res.status(401).send('Unauthorized');
            return;
        }
        // --- 🎯 Reuse dashboard controller logic ---
        // We'll capture the report instead of sending it
        const mockRes = {
            status: () => mockRes,
            json: (data) => {
                // ✅ Intercept the report
                return sendExcel(res, data, { ownerId, filters: req.query });
            },
            send: () => { }
        };
        // Call the same logic
        yield (0, reportCustomController_1.dashboardReportController)(req, mockRes);
    }
    catch (error) {
        console.error('Excel export failed:', error);
        res.status(500).send('Failed to generate Excel report');
    }
});
exports.exportDashboardExcel = exportDashboardExcel;
// --- Helper: Generate and send Excel ---
function sendExcel(res, report, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const buffer = yield (0, excelReport_1.generateDashboardExcel)(report, Object.assign({ ownerId: filters.ownerId }, filters.filters));
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `dashboard-report-${dateStr}.xlsx`;
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Length', buffer.length);
            res.send(buffer);
        }
        catch (err) {
            console.error('Failed to generate Excel:', err);
            res.status(500).send('Failed to generate Excel');
        }
    });
}
