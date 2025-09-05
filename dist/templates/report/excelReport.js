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
exports.generateDashboardExcel = generateDashboardExcel;
// src/templates/report/excelReport.ts
const exceljs_1 = __importDefault(require("exceljs"));
const unifiedReport_1 = require("../../service/report/unifiedReport");
const summarySheet_1 = require("./summarySheet");
const ownerReport_1 = require("./ownerReport");
const propertyReport_1 = require("./propertyReport");
const roomTypeReport_1 = require("./roomTypeReport");
const helper_1 = require("./helper"); // Ensure autoFitColumns is imported
// const SHEET_NAME_MAX = 31; // Excel limit - already defined in helper
function generateDashboardExcel(context, format) {
    return __awaiter(this, void 0, void 0, function* () {
        const excelContext = Object.assign(Object.assign({}, context), { options: Object.assign(Object.assign({}, context.options), { fetchAllData: true }) });
        const report = yield (0, unifiedReport_1.handleUnifiedReport)(excelContext);
        const workbook = new exceljs_1.default.Workbook();
        // Add summary sheet (always)
        (0, summarySheet_1.addSummarySheet)(workbook, report, context, format);
        // Add data sheets based on format
        switch (format) {
            case 'FULL':
                (0, ownerReport_1.addFullOwnerSheets)(workbook, report);
                break;
            case 'PROPERTY':
                (0, propertyReport_1.addPropertySheets)(workbook, report, context.filters.propertyId);
                break;
            case 'ROOM_TYPE':
                (0, roomTypeReport_1.addRoomTypeSheets)(workbook, report, context.filters.roomTypeId);
                break;
        }
        // Add filters sheet
        (0, helper_1.addFiltersSheet)(workbook, context.filters);
        // --- Auto-fit columns AFTER all sheets and data are added ---
        (0, helper_1.autoFitColumns)(workbook);
        // --- End of Auto-fit ---
        const buffer = yield workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    });
}
