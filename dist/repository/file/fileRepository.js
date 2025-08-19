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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class FileRepository {
    // Create file record
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.picture.create({ data });
        });
    }
    // Find file by ID
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.picture.findUnique({
                where: { id },
            });
        });
    }
    // Delete file record
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.picture.delete({
                where: { id },
            });
        });
    }
    // List files with pagination
    findMany(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.picture.findMany(options);
        });
    }
    // Count files
    count(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.picture.count({ where });
        });
    }
    // Find files by type
    findByType(type, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.picture.findMany({
                where: { type },
                take: limit,
                orderBy: { createdAt: "desc" },
            });
        });
    }
    // Update file record
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.picture.update({
                where: { id },
                data,
            });
        });
    }
}
exports.default = new FileRepository();
