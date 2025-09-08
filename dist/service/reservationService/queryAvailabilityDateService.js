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
exports.getUnavailableDates = getUnavailableDates;
const prisma_1 = __importDefault(require("../../prisma"));
function getUnavailableDates(roomTypeId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const records = yield prisma_1.default.availability.findMany({
            where: Object.assign({ roomTypeId, availableCount: 0 }, (startDate &&
                endDate && {
                date: {
                    gte: startDate,
                    lte: endDate // inclusive
                }
            })),
            select: {
                date: true
            },
            orderBy: { date: 'asc' }
        });
        return records.map(r => ({
            date: r.date.toISOString().split('T')[0], // YYYY-MM-DD
            isAvailable: false
        }));
    });
}
