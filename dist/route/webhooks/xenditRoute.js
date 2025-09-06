"use strict";
// routes/xendit.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller_1 = require("../../controller"); // Adjust path if needed
const router = express_1.default.Router();
// Apply express.raw() middleware ONLY to the Xendit webhook route
// This is crucial for verifying the Xendit-Signature
router.post('/invoice', express_1.default.raw({ type: 'application/json' }), controller_1.handleXenditInvoiceCallback);
exports.default = router;
