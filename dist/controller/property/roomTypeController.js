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
exports.deleteRoomType = exports.updateRoomType = exports.getRoomTypesByProperty = exports.createRoomType = void 0;
const roomTypeService_1 = __importDefault(require("../../service/property/roomTypeService"));
const createRoomType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ownerId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.body.ownerId; // gunakan userId dari middleware
        const data = req.body;
        const roomType = yield roomTypeService_1.default.createRoomType(data, ownerId);
        return res.status(201).json({ success: true, data: roomType });
    }
    catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});
exports.createRoomType = createRoomType;
const getRoomTypesByProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ownerId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || "");
        const propertyId = String(req.query.propertyId || "");
        if (!propertyId) {
            return res
                .status(400)
                .json({ success: false, message: "propertyId is required" });
        }
        const roomTypes = yield roomTypeService_1.default.getRoomTypesByProperty(propertyId, ownerId);
        return res.status(200).json({ success: true, data: roomTypes });
    }
    catch (error) {
        return res
            .status(400)
            .json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.getRoomTypesByProperty = getRoomTypesByProperty;
const updateRoomType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ownerId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || "");
        const id = String(req.params.id || "");
        const data = req.body;
        const updated = yield roomTypeService_1.default.updateRoomType(id, data, ownerId);
        return res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        return res
            .status(400)
            .json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.updateRoomType = updateRoomType;
const deleteRoomType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ownerId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || "");
        const id = String(req.params.id || "");
        yield roomTypeService_1.default.deleteRoomType(id, ownerId);
        return res
            .status(200)
            .json({ success: true, message: "Room type deleted" });
    }
    catch (error) {
        return res
            .status(400)
            .json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.deleteRoomType = deleteRoomType;
