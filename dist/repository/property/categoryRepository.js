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
const prisma_1 = __importDefault(require("../../prisma"));
class CategoryRepository {
    // Get all categories
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.category.findMany({
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    // Find category by ID
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.category.findUnique({
                where: { id }
            });
        });
    }
    // Find category by name
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.category.findUnique({
                where: { name }
            });
        });
    }
    // Create new category
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.category.create({
                data
            });
        });
    }
    // Update category
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.category.update({
                where: { id },
                data
            });
        });
    }
    // Delete category
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.category.delete({
                where: { id }
            });
        });
    }
    // Check if category is being used by any property
    isUsedByProperty(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield prisma_1.default.property.count({
                where: { categoryId: id }
            });
            return count > 0;
        });
    }
}
exports.default = new CategoryRepository();
