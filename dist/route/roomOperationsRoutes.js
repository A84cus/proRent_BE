"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availabilityRoute_1 = __importDefault(require("./availabilityRoute"));
const peakRateRoutes_1 = __importDefault(require("./peakRateRoutes"));
const router = (0, express_1.Router)();
// Room-specific operations - availability & pricing
router.use("/availability", availabilityRoute_1.default);
router.use("/peak-rates", peakRateRoutes_1.default);
exports.default = router;
