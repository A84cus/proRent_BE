// routes/xendit.ts

import * as express from 'express';
import { handleXenditInvoiceCallback } from '../../controller'; // Adjust path if needed

const router = express.Router();

// Apply express.raw() middleware ONLY to the Xendit webhook route
// This is crucial for verifying the Xendit-Signature
router.post('/xendit/invoice', handleXenditInvoiceCallback);

export default router;
