// routes/xendit.ts

import express from 'express';
import { handleXenditInvoiceCallback } from '../../controller'; // Adjust path if needed

const router = express.Router();

// Apply express.raw() middleware ONLY to the Xendit webhook route
// This is crucial for verifying the Xendit-Signature
router.post('/invoice', express.raw({ type: 'application/json' }), handleXenditInvoiceCallback);

export default router;
