"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerRoutes = exports.categoryRoute = exports.peakRateRoutes = exports.availabilityRoute = exports.roomOperationsRoutes = exports.roomRoute = exports.publicPropertyRoutes = exports.propertyRoute = void 0;
// Property Routes Export
var propertyRoute_1 = require("./propertyRoute");
Object.defineProperty(exports, "propertyRoute", { enumerable: true, get: function () { return __importDefault(propertyRoute_1).default; } });
var publicPropertyRoutes_1 = require("./publicPropertyRoutes");
Object.defineProperty(exports, "publicPropertyRoutes", { enumerable: true, get: function () { return __importDefault(publicPropertyRoutes_1).default; } });
var roomRoute_1 = require("./roomRoute");
Object.defineProperty(exports, "roomRoute", { enumerable: true, get: function () { return __importDefault(roomRoute_1).default; } });
var roomOperationsRoutes_1 = require("./roomOperationsRoutes");
Object.defineProperty(exports, "roomOperationsRoutes", { enumerable: true, get: function () { return __importDefault(roomOperationsRoutes_1).default; } });
var availabilityRoute_1 = require("./availabilityRoute");
Object.defineProperty(exports, "availabilityRoute", { enumerable: true, get: function () { return __importDefault(availabilityRoute_1).default; } });
var peakRateRoutes_1 = require("./peakRateRoutes");
Object.defineProperty(exports, "peakRateRoutes", { enumerable: true, get: function () { return __importDefault(peakRateRoutes_1).default; } });
var categoryRoute_1 = require("./categoryRoute");
Object.defineProperty(exports, "categoryRoute", { enumerable: true, get: function () { return __importDefault(categoryRoute_1).default; } });
var ownerRoutes_1 = require("./ownerRoutes");
Object.defineProperty(exports, "ownerRoutes", { enumerable: true, get: function () { return __importDefault(ownerRoutes_1).default; } });
