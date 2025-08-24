"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultPeriodParams = getDefaultPeriodParams;
exports.validateFinalPeriodParams = validateFinalPeriodParams;
const cronjobValidationService_1 = require("./cronjobValidationService");
function getDefaultPeriodParams(periodType, periodKey, year, month) {
    const now = new Date();
    const finalPeriodType = periodType;
    const finalPeriodKey = periodKey;
    const finalYear = year;
    const finalMonth = month;
    return processPeriodParams(finalPeriodType, finalPeriodKey, finalYear, finalMonth, now);
}
function processPeriodParams(periodType, periodKey, year, month, now) {
    if (shouldHandleMissingParams(periodType, periodKey)) {
        const result = (0, cronjobValidationService_1.handleMissingPeriodTypeAndKey)(year, month, now);
        return finalizeParams(result.periodType, result.periodKey, result.year, result.month);
    }
    return finalizeParams(periodType, periodKey, year, month);
}
function shouldHandleMissingParams(periodType, periodKey) {
    return (periodType === undefined || periodType === null) && (periodKey === undefined || periodKey === null);
}
function finalizeParams(periodType, periodKey, year, month) {
    const finalPeriodType = validateAndDefaultPeriodType(periodType);
    const finalPeriodKey = validateAndDefaultPeriodKey(finalPeriodType, periodKey, year, month);
    const finalYear = validateAndDefaultYear(finalPeriodKey, year);
    const finalMonth = validateAndDefaultMonth(finalPeriodType, finalPeriodKey, month);
    return validateFinalParams(finalPeriodType, finalPeriodKey, finalYear, finalMonth);
}
function validateAndDefaultPeriodType(periodType) {
    if (!(0, cronjobValidationService_1.isPeriodTypeValid)(periodType)) {
        const defaultType = 'YEAR';
        console.warn(`Invalid or missing final periodType '${periodType}'. Forcing default: ${defaultType}`);
        return defaultType;
    }
    return periodType;
}
function validateAndDefaultPeriodKey(periodType, periodKey, year, month) {
    if ((0, cronjobValidationService_1.isPeriodKeyValid)(periodKey)) {
        return periodKey;
    }
    console.warn(`Invalid or missing final periodKey '${periodKey}'. Attempting to derive or default.`);
    return derivePeriodKey(periodType, year, month);
}
function derivePeriodKey(periodType, year, month) {
    const now = new Date();
    if (periodType === 'DAY') {
        return (0, cronjobValidationService_1.buildDayPeriod)(now).periodKey;
    }
    else if (periodType === 'MONTH' && (0, cronjobValidationService_1.isYearValid)(year) && (0, cronjobValidationService_1.isMonthValid)(month)) {
        return (0, cronjobValidationService_1.buildMonthPeriod)(year, month).periodKey;
    }
    else if (periodType === 'YEAR' && (0, cronjobValidationService_1.isYearValid)(year)) {
        return (0, cronjobValidationService_1.buildYearPeriod)(year).periodKey;
    }
    else {
        return handlePeriodKeyFallback(now, year, periodType);
    }
}
function handlePeriodKeyFallback(now, year, periodType) {
    const fallbackYear = year !== null && year !== void 0 ? year : (0, cronjobValidationService_1.deriveYearFromDate)(now);
    console.warn(`Could not derive periodKey. Forcing to year: ${fallbackYear}`);
    if (periodType !== 'YEAR') {
        console.warn(`Forced periodKey derivation implies YEAR type.`);
    }
    return `${fallbackYear}`;
}
function validateAndDefaultYear(periodKey, year) {
    if ((0, cronjobValidationService_1.isYearValid)(year)) {
        return year;
    }
    const derivedYear = (0, cronjobValidationService_1.deriveYearFromPeriodKey)(periodKey);
    if (derivedYear !== undefined && !isNaN(derivedYear)) {
        console.log(`Derived missing finalYear ${derivedYear} from periodKey ${periodKey}`);
        return derivedYear;
    }
    const currentYear = (0, cronjobValidationService_1.deriveYearFromDate)(new Date());
    console.warn(`Final year is still invalid/missing. Forcing to current year: ${currentYear}`);
    return currentYear;
}
function validateAndDefaultMonth(periodType, periodKey, month) {
    if (periodType === 'YEAR') {
        return null;
    }
    else if (periodType === 'MONTH') {
        return handleMonthForPeriodType('MONTH', periodKey, month);
    }
    else if (periodType === 'DAY') {
        return handleMonthForPeriodType('DAY', periodKey, month);
    }
    return month || null;
}
function handleMonthForPeriodType(type, periodKey, month) {
    if ((0, cronjobValidationService_1.isMonthValid)(month)) {
        return month || null;
    }
    const derivedMonth = (0, cronjobValidationService_1.deriveMonthFromPeriodKey)(periodKey);
    if (derivedMonth !== null) {
        console.log(`Derived missing/invalid finalMonth ${derivedMonth} for ${type} type from periodKey.`);
        return derivedMonth;
    }
    const currentMonth = (0, cronjobValidationService_1.deriveMonthFromDate)(new Date());
    console.warn(`Could not derive valid finalMonth for ${type} type. Defaulting to current month: ${currentMonth}`);
    return currentMonth;
}
function validateFinalParams(periodType, periodKey, year, month) {
    if (!periodType || !periodKey || isNaN(year)) {
        const now = new Date();
        const criticalDefaultYear = now.getFullYear();
        console.error('Critical failure in deriving period parameters. Forcing ultimate defaults.');
        return {
            periodType: 'YEAR',
            periodKey: `${criticalDefaultYear}`,
            year: criticalDefaultYear,
            month: null
        };
    }
    return {
        periodType,
        periodKey,
        year,
        month: month || null
    };
}
function validateFinalPeriodParams(params) {
    const { periodType, periodKey, year } = params;
    if (!periodType || !['DAY', 'MONTH', 'YEAR'].includes(periodType)) {
        throw new Error(`Invalid final periodType after defaulting: ${periodType}. Must be DAY, MONTH, or YEAR.`);
    }
    if (!periodKey || typeof periodKey !== 'string') {
        throw new Error(`Invalid or missing final periodKey after defaulting: ${periodKey}. Must be a string.`);
    }
    if (year === undefined || isNaN(year)) {
        throw new Error(`Invalid or missing final year after defaulting: ${year}. Must be a number.`);
    }
    console.log(`Validated final period parameters: ${periodType} ${periodKey} (Year: ${year})`);
}
