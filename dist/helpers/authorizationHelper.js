"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthorizationHelper {
    // Check if upload type requires authentication
    requiresAuthentication(type) {
        return ["profile", "proof"].includes(type);
    }
    // Check if user is authenticated
    isAuthenticated(req) {
        return !!req.user;
    }
    // Check if user can upload specific type
    canUploadType(req, type) {
        if (this.requiresAuthentication(type) && !this.isAuthenticated(req)) {
            return {
                canUpload: false,
                error: "Authentication required for this upload type.",
            };
        }
        return { canUpload: true };
    }
    // Check if user can delete file
    canDeleteFile(req, fileOwnerId) {
        if (!this.isAuthenticated(req)) {
            return {
                canDelete: false,
                error: "Authentication required to delete files.",
            };
        }
        // Add additional checks here if needed (e.g., file ownership)
        // if (fileOwnerId && req.user?.userId !== fileOwnerId) {
        //   return {
        //     canDelete: false,
        //     error: "You can only delete your own files."
        //   };
        // }
        return { canDelete: true };
    }
    // Get user ID from request
    getUserId(req) {
        var _a;
        return (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    }
}
exports.default = new AuthorizationHelper();
