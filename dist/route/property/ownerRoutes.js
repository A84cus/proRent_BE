"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryRoute_1 = __importDefault(require("./categoryRoute"));
const propertyRoute_1 = __importDefault(require("./propertyRoute"));
const roomRoute_1 = __importDefault(require("./roomRoute"));
const roomTypeRoute_1 = __importDefault(require("./roomTypeRoute"));
const router = (0, express_1.Router)();
// Owner management routes - semua sudah include auth middleware di masing-masing route
router.use("/categories", categoryRoute_1.default);
router.use("/properties", propertyRoute_1.default);
router.use("/rooms", roomRoute_1.default);
router.use("/room-types", roomTypeRoute_1.default);
exports.default = router;
