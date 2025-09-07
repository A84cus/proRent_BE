"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawBodyMiddleware = rawBodyMiddleware;
const stream_1 = require("stream");
function rawBodyMiddleware(req, res, next) {
    const chunks = [];
    // Kumpulin semua chunk dari request body
    req.on('data', chunk => {
        chunks.push(chunk);
    });
    req.on('end', () => {
        const rawBody = Buffer.concat(chunks);
        req.rawBody = rawBody;
        // 🔑 Re-create stream dari rawBody supaya middleware berikutnya (express.json) tetap bisa parse
        req.headers['content-length'] = rawBody.length;
        req.pipe = function (dest) {
            const stream = stream_1.Readable.from(rawBody);
            return stream.pipe(dest);
        };
        next();
    });
    req.on('error', err => {
        console.error('Error reading raw body:', err);
        next(err);
    });
}
