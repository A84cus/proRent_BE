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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePropertyOwnership = validatePropertyOwnership;
exports.validateRoomTypeOwnership = validateRoomTypeOwnership;
exports.isPeriodTypeValid = isPeriodTypeValid;
exports.isPeriodKeyValid = isPeriodKeyValid;
exports.isYearValid = isYearValid;
exports.isMonthValid = isMonthValid;
exports.deriveYearFromDate = deriveYearFromDate;
exports.deriveMonthFromDate = deriveMonthFromDate;
exports.deriveYesterdayKey = deriveYesterdayKey;
exports.deriveYearFromPeriodKey = deriveYearFromPeriodKey;
exports.deriveMonthFromPeriodKey = deriveMonthFromPeriodKey;
exports.buildYearPeriod = buildYearPeriod;
exports.buildMonthPeriod = buildMonthPeriod;
exports.buildDayPeriod = buildDayPeriod;
exports.handleMissingPeriodTypeAndKey = handleMissingPeriodTypeAndKey;
// src/services/report/cronjobValidationService.ts
const prisma_1 = __importDefault(require("../../../prisma"));
function validatePropertyOwnership(ownerId, propertyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const propertyCheck = yield prisma_1.default.property.findUnique({
            where: { id: propertyId, OwnerId: ownerId },
            select: { id: true }
        });
        if (!propertyCheck) {
            throw new Error(`Property with ID ${propertyId} not found or does not belong to owner ${ownerId}.`);
        }
    });
}
function validateRoomTypeOwnership(ownerId, roomTypeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomTypeCheck = yield prisma_1.default.roomType.findUnique({
            where: {
                id: roomTypeId,
                property: {
                    OwnerId: ownerId // Validate via property ownership relation
                }
            },
            select: { id: true }
        });
        if (!roomTypeCheck) {
            throw new Error(`RoomType with ID ${roomTypeId} not found or does not belong to an owner property ${ownerId}.`);
        }
    });
}
function isPeriodTypeValid(periodType) {
    return !!periodType && ['DAY', 'MONTH', 'YEAR'].includes(periodType);
}
function isPeriodKeyValid(periodKey) {
    return !!periodKey && typeof periodKey === 'string';
}
function isYearValid(year) {
    return year !== undefined && year !== null && !isNaN(year);
}
function isMonthValid(month) {
    return month !== undefined && month !== null && !isNaN(month) && month >= 1 && month <= 12;
}
function deriveYearFromDate(date) {
    return date.getFullYear();
}
function deriveMonthFromDate(date) {
    return date.getMonth() + 1;
}
function deriveYesterdayKey(now) {
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}
function deriveYearFromPeriodKey(periodKey) {
    if (/^\d{4}$/.test(periodKey)) {
        return Number(periodKey);
    }
    const parts = periodKey.split('-');
    if (parts.length >= 1 && /^\d{4}$/.test(parts[0])) {
        return Number(parts[0]);
    }
    return undefined;
}
function deriveMonthFromPeriodKey(periodKey) {
    const parts = periodKey.split('-');
    if (parts.length >= 2) {
        const monthPart = Number(parts[1]);
        if (!isNaN(monthPart) && monthPart >= 1 && monthPart <= 12) {
            return monthPart;
        }
    }
    return null;
}
function buildYearPeriod(year) {
    console.log(`Deriving period: YEAR ${year} (from provided year only)`);
    return {
        periodType: 'YEAR',
        periodKey: `${year}`,
        month: null
    };
}
function buildMonthPeriod(year, month) {
    console.log(`Deriving period: MONTH ${year}-${String(month).padStart(2, '0')} (from provided year and month)`);
    return {
        periodType: 'MONTH',
        periodKey: `${year}-${String(month).padStart(2, '0')}`,
        month
    };
}
function buildDayPeriod(now) {
    const yesterdayKey = deriveYesterdayKey(now);
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    console.log(`Defaulted missing DAY periodKey to yesterday: ${yesterdayKey}`);
    return {
        periodType: 'DAY',
        periodKey: yesterdayKey,
        year: yesterday.getFullYear(),
        month: yesterday.getMonth() + 1
    };
}
function handleMissingPeriodTypeAndKey(year, month, now) {
    // --- CHANGE DEFAULT LOGIC HERE ---
    console.log("Period type and/or period key not specified for cron job, defaulting to 'YEAR' and current year.");
    if (isYearValid(year)) {
        // If year is valid, default to YEAR type for that specific year
        console.log(`Valid year ${year} provided, defaulting to YEAR ${year}.`);
        return handleValidYear(year, month);
    }
    else {
        // If no valid year, default to the CURRENT YEAR
        console.log('No valid year provided, defaulting to CURRENT YEAR.');
        const currentYear = deriveYearFromDate(now);
        // --- DEFAULT TO 'YEAR' TYPE ---
        return Object.assign(Object.assign({}, buildYearPeriod(currentYear)), { year: currentYear });
    }
}
function handleValidYear(year, month) {
    if (month === undefined || month === null) {
        return Object.assign(Object.assign({}, buildYearPeriod(year)), { year });
    }
    else if (isMonthValid(month)) {
        return Object.assign(Object.assign({}, buildMonthPeriod(year, month)), { year, month: month });
    }
    else {
        return handleInvalidMonth(year);
    }
}
function handleInvalidMonth(year) {
    console.warn(`Provided year ${year} but invalid month. Defaulting to YEAR ${year}.`);
    return Object.assign(Object.assign({}, buildYearPeriod(year)), { year });
}
function handleMissingYear(now) {
    console.log("Neither valid 'year' nor valid 'periodType/periodKey' provided. Defaulting to 'YEAR' for current year.");
    const currentYear = deriveYearFromDate(now);
    return Object.assign(Object.assign({}, buildYearPeriod(currentYear)), { year: currentYear });
}
