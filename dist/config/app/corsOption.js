"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization"],
    credentials: true,
};
exports.default = corsOptions;
