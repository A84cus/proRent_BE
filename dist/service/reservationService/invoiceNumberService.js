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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceNumber = generateInvoiceNumber;
exports.extractSerialFromInvoiceNumber = extractSerialFromInvoiceNumber;
function generateInvoiceNumber(tx) {
    return __awaiter(this, void 0, void 0, function* () {
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0]; // e.g., "2025-04-05"
        // Get or create the counter for today
        const counterRecord = yield tx.invoiceCounter.upsert({
            where: { dateKey },
            update: { counter: { increment: 1 } },
            create: { dateKey, counter: 1 }
        });
        const incrementedCounter = counterRecord.counter;
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const serial = String(incrementedCounter).padStart(3, '0');
        return `INV-${year}/${month}/${day}-${serial}`;
    });
}
function extractSerialFromInvoiceNumber(invoiceNumber) {
    const parts = invoiceNumber.split('-');
    if (parts.length === 2) {
        return parseInt(parts[1], 10);
    }
    return 1; // fallback
}
