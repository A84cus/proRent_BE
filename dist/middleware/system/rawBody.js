"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawBodyMiddleware = rawBodyMiddleware;
const stream_1 = require("stream");
function rawBodyMiddleware(req, res, next) {
    const chunks = [];
    req.on('data', chunk => {
        chunks.push(chunk);
    });
    req.on('end', () => {
        const rawBody = Buffer.concat(chunks);
        req.rawBody = rawBody;
        // 👇 Reconstruct stream so express.json() can still parse body later (if needed)
        const pass = new stream_1.PassThrough();
        pass.end(rawBody);
        // Override pipe to use our reconstructed stream
        req.pipe = pass.pipe.bind(pass);
        // Optional: Update content-length if needed (some parsers check this)
        req.headers['content-length'] = String(rawBody.length);
        next();
    });
    req.on('error', err => {
        console.error('Error reading raw body:', err);
        next(err);
    });
}
