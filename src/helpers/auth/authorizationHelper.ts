import { Request } from "express";
import { FileType } from "../../interfaces";

class AuthorizationHelper {
  // Check if upload type requires authentication
  requiresAuthentication(type: FileType): boolean {
    return ["profile", "proof"].includes(type);
  }

  // Check if user is authenticated
  isAuthenticated(req: Request): boolean {
    return !!req.user;
  }

  // Check if user can upload specific type
  canUploadType(
    req: Request,
    type: FileType
  ): { canUpload: boolean; error?: string } {
    if (this.requiresAuthentication(type) && !this.isAuthenticated(req)) {
      return {
        canUpload: false,
        error: "Authentication required for this upload type.",
      };
    }

    return { canUpload: true };
  }

  // Check if user can delete file
  canDeleteFile(
    req: Request,
    fileOwnerId?: string
  ): { canDelete: boolean; error?: string } {
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
  getUserId(req: Request): string | undefined {
    return req.user?.userId;
  }
}

export default new AuthorizationHelper();
