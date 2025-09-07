"use strict";
// src/middleware/system/rawBodyMiddleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawBodyMiddleware = rawBodyMiddleware;
function rawBodyMiddleware(req, res, next) {
    // Array to hold chunks of data
    const chunks = [];
    // Listen for data events
    req.on('data', chunk => {
        chunks.push(chunk);
    });
    // Listen for end event
    req.on('end', () => {
        // Concatenate all chunks into a single buffer
        const rawBody = Buffer.concat(chunks);
        // Attach it to the request object
        req.rawBody = rawBody;
        next();
    });
    // Listen for error event
    req.on('error', err => {
        console.error('Error reading raw body:', err);
        next(err);
    });
}
