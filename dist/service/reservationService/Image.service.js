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
exports.updateImage = exports.removeImage = exports.uploadImage = void 0;
const cloudinary_1 = require("../../utils/cloudinary");
const uploadImage = (file, folder) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, cloudinary_1.cloudinaryUpload)(file, folder);
    return result.secure_url;
});
exports.uploadImage = uploadImage;
const removeImage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, cloudinary_1.cloudinaryRemove)(url);
});
exports.removeImage = removeImage;
const updateImage = (file, folder, url) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, cloudinary_1.cloudinaryRemove)(url);
    return yield (0, exports.uploadImage)(file, folder);
});
exports.updateImage = updateImage;
