"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAvailability = loadAvailability;
// service/report/cases/loadAvailability.ts
const availabilityService = __importStar(require("../../reservationService/availabilityService"));
function loadAvailability(roomTypeMap, reportStart, reportEnd) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const rtid of roomTypeMap.keys()) {
            try {
                const totalQuantity = yield availabilityService.getRoomTypeTotalQuantity(rtid);
                const records = yield availabilityService.getActualAvailabilityRecords(rtid, reportStart, reportEnd);
                const dates = records.map((r) => ({
                    date: r.date.toISOString().split('T')[0],
                    available: r.availableCount,
                    isAvailable: r.availableCount > 0
                }));
                const roomTypeEntry = roomTypeMap.get(rtid);
                if (roomTypeEntry) {
                    // Add safety check
                    roomTypeEntry.availability = { totalQuantity, dates };
                }
            }
            catch (error) {
                console.error(`Error loading availability for room type ${rtid}:`, error);
                // Decide how to handle individual errors - maybe set default availability or log
                const roomTypeEntry = roomTypeMap.get(rtid);
                if (roomTypeEntry) {
                    roomTypeEntry.availability = { totalQuantity: 0, dates: [] }; // Default
                }
            }
        }
        return roomTypeMap;
    });
}
