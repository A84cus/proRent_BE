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
exports.calculateTotalPrice = calculateTotalPrice;
// services/pricingService.ts
const prisma_1 = __importDefault(require("../../prisma"));
function calculateTotalPrice(roomTypeId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const roomTypes = yield prisma_1.default.roomType.findUnique({
            where: { id: roomTypeId },
            include: { peakRates: true }
        });
        if (!roomTypes) {
            throw new Error('RoomType not found');
        }
        let total = 0;
        const currentDate = new Date(startDate);
        while (currentDate < endDate) {
            total += yield getDailyPrice(roomTypes, currentDate);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return total;
    });
}
function getDailyPrice(roomType, date) {
    return __awaiter(this, void 0, void 0, function* () {
        const basePrice = Number(roomType.basePrice);
        const peakRate = roomType.peakRates.find((pr) => {
            const start = new Date(pr.startDate);
            const end = new Date(pr.endDate);
            return date >= start && date < end;
        });
        if (!peakRate) {
            return basePrice;
        }
        if (peakRate.rateType === 'FIXED') {
            return Number(peakRate.value);
        }
        else if (peakRate.rateType === 'PERCENTAGE') {
            return basePrice * (1 + Number(peakRate.value) / 100);
        }
        return basePrice;
    });
}
