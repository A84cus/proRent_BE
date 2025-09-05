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
// scripts/fixAvailability.ts
const prisma_1 = __importDefault(require("../prisma"));
const availabilityService_1 = require("../service/reservationService/availabilityService");
function fixAvailability() {
    return __awaiter(this, void 0, void 0, function* () {
        const availabilities = yield prisma_1.default.availability.findMany();
        for (const avail of availabilities) {
            const totalQuantity = yield (0, availabilityService_1.getRoomTypeTotalQuantity)(avail.roomTypeId);
            if (avail.availableCount > totalQuantity) {
                console.log(`Fixing: ${avail.id} | ${avail.date} | ${avail.availableCount} → ${totalQuantity}`);
                yield prisma_1.default.availability.update({
                    where: { id: avail.id },
                    data: { availableCount: totalQuantity }
                });
            }
        }
        console.log('Availability fix complete.');
    });
}
fixAvailability().catch(console.error);
