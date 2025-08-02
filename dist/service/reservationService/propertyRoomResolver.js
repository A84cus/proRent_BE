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
exports.resolveTargetRoomTypeId = resolveTargetRoomTypeId;
exports.validatePropertyRentalTypeRequirements = validatePropertyRentalTypeRequirements;
// services/propertyRoomResolver.ts
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client"); // Make sure this enum is in your schema
function resolveTargetRoomTypeId(propertyId, providedRoomTypeId) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Fetch Property and its rooms (specifically the one marked as whole unit if needed)
        const property = yield prisma_1.default.property.findUnique({
            where: { id: propertyId },
            include: {
                roomTypes: {
                    where: providedRoomTypeId ? { id: providedRoomTypeId } : { isWholeUnit: true }
                }
            }
        });
        if (!property) {
            throw new Error('Property not found');
        }
        let targetRoomTypeId;
        if (property.rentalType === client_1.PropertyRentalType.WHOLE_PROPERTY) {
            // --- Logic for WHOLE_PROPERTY ---
            const wholeUnitRoom = property.roomTypes.find(r => r.isWholeUnit);
            if (!wholeUnitRoom) {
                throw new Error('Configuration Error: Whole property unit room not found for this property.');
            }
            targetRoomTypeId = wholeUnitRoom.id;
            if (providedRoomTypeId && providedRoomTypeId !== targetRoomTypeId) {
                console.warn('Ignoring provided roomId for WHOLE_PROPERTY type booking. Using designated whole unit.');
            }
        }
        else if (property.rentalType === client_1.PropertyRentalType.ROOM_BY_ROOM) {
            // --- Logic for ROOM_BY_ROOM ---
            if (!providedRoomTypeId) {
                throw new Error('Room ID is required for room-by-room rental type.');
            }
            const selectedRoom = property.roomTypes.find(r => r.id === providedRoomTypeId);
            if (!selectedRoom) {
                throw new Error('Selected room not found for this property or does not belong to it.');
            }
            targetRoomTypeId = providedRoomTypeId;
        }
        else {
            throw new Error(`Unsupported property rental type: ${property.rentalType}`);
        }
        return targetRoomTypeId;
    });
}
function validatePropertyRentalTypeRequirements(propertyId, providedRoomTypeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const property = yield prisma_1.default.property.findUnique({
            where: { id: propertyId },
            select: { rentalType: true } // Only fetch the type needed for validation
        });
        if (!property) {
            throw new Error('Property not found');
        }
        if (property.rentalType === client_1.PropertyRentalType.WHOLE_PROPERTY) {
        }
        else if (property.rentalType === client_1.PropertyRentalType.ROOM_BY_ROOM) {
            if (!providedRoomTypeId) {
                throw new Error('Room ID is required for room-by-room rental type.');
            }
            // You could add more specific validations here if needed for ROOM_BY_ROOM
        }
        else {
            throw new Error(`Unsupported property rental type: ${property.rentalType}`);
        }
    });
}
