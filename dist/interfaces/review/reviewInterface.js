"use strict";
// types/reviewTypes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortOrder = exports.sortBy = void 0;
var sortBy;
(function (sortBy) {
    sortBy["rating"] = "rating";
    sortBy["createdAt"] = "createdAt";
    sortBy["updatedAt"] = "updatedAt";
})(sortBy || (exports.sortBy = sortBy = {}));
var sortOrder;
(function (sortOrder) {
    sortOrder["asc"] = "asc";
    sortOrder["desc"] = "desc";
})(sortOrder || (exports.sortOrder = sortOrder = {}));
