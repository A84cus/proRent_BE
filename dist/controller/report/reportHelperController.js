"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateParam = parseDateParam;
exports.parseStatusArray = parseStatusArray;
const client_1 = require("@prisma/client");
// --- Helper Function ---
function parseDateParam(dateString) {
    if (!dateString) {
        return undefined;
    }
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
}
// --- Helper Function to Parse Status Array ---
function parseStatusArray(statusStrings) {
    if (!statusStrings) {
        return undefined; // Let service apply default
    }
    // Ensure it's an array
    const statusArray = Array.isArray(statusStrings) ? statusStrings : [statusStrings];
    const validStatuses = [];
    for (const statusStr of statusArray) {
        // Check if the string value exists in the Status enum
        if (Object.values(client_1.Status).includes(statusStr)) {
            validStatuses.push(statusStr);
        }
        // Optionally log or handle invalid status strings
        // else {
        //     console.warn(`Invalid status string provided: ${statusStr}`);
        // }
    }
    return validStatuses.length > 0 ? validStatuses : undefined; // Return undefined if none were valid
}
