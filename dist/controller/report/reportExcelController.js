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
const paymentProofController_1 = require("../reservationController/paymentProofController");
const excelReport_1 = require("../../templates/report/excelReport");
const buildContextByRequest_1 = require("../../service/report/buildContextByRequest");
const exportDashboardExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ownerId = (0, paymentProofController_1.getUserIdFromRequest)(req);
        if (!ownerId) {
            res.status(401).send('Unauthorized');
            return;
        }
        // ✅ 1. Build context from request
        const context = (0, buildContextByRequest_1.buildContextFromRequest)(req, ownerId);
        // ✅ 2. Get export format: FULL | PROPERTY | ROOM_TYPE
        const format = (_a = req.query.format) === null || _a === void 0 ? void 0 : _a.toUpperCase();
        if (!['FULL', 'PROPERTY', 'ROOM_TYPE'].includes(format)) {
            res.status(400).send('Invalid format. Use: FULL, PROPERTY, ROOM_TYPE');
            return;
        }
        // ✅ 3. Generate Excel buffer
        const buffer = yield (0, excelReport_1.generateDashboardExcel)(context, format);
        // ✅ 4. Send file
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `dashboard-report-${format.toLowerCase()}-${dateStr}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    }
    catch (error) {
        console.error('Excel export failed:', error);
        res.status(500).send('Failed to generate Excel report');
    }
});
exports.exportDashboardExcel = exportDashboardExcel;
