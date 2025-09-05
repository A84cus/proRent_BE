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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailabilityScheduleHandler = getAvailabilityScheduleHandler;
const availabilityService_1 = require("../../service/reservationService/availabilityService");
const constants_1 = require("../../constants");
function getAvailabilityScheduleHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { roomTypeId } = req.params;
            const { startDate, endDate } = req.query;
            if (!roomTypeId) {
                res.status(400).json({ message: constants_1.RESERVATION_ERROR_MESSAGES.ROOMTYPE_ID_REQUIRED });
            }
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            const records = yield (0, availabilityService_1.getActualAvailabilityRecords)(roomTypeId, start, end);
            const formatted = records.map(r => ({
                date: r.date.toISOString().split('T')[0],
                availableCount: r.availableCount
            }));
            res.json({ data: formatted });
            return;
        }
        catch (error) {
            res.status(500).json({ error: error.message || constants_1.RESERVATION_ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    });
}
