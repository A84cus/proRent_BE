// routes/xendit.ts

import * as express from 'express';
import { handleXenditInvoiceCallback } from '../../controller'; // Adjust path if needed
import { rawBodyMiddleware } from '../../middleware/system/rawBody';

const router = express.Router();

router.use(rawBodyMiddleware);

// Apply express.raw() middleware ONLY to the Xendit webhook route
// This is crucial for verifying the Xendit-Signature
router.post('/xendit/invoice', handleXenditInvoiceCallback);

export default router;
