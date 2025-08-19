import { Request, Response } from "express";
import uploadService from "../../service/upload/uploadService";
import multerConfigService from "../../service/upload/multerConfigService";
import responseHelper from "../../helpers/system/responseHelper";
import authorizationHelper from "../../helpers/auth/authorizationHelper";
import logger from "../../utils/system/logger";
import { handleUploadError } from "../../helpers/system/errorHandler";
import { uploadFileSchema } from "../../validations";
import {
  UPLOAD_ERROR_MESSAGES,
  UPLOAD_SUCCESS_MESSAGES,
} from "../../constants/controllers/upload";

class UploadController {
  // POST /upload - Generic file upload endpoint
  async uploadFile(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = uploadFileSchema.parse(req.body);
      const { type, alt } = validatedData;

      // Check if file exists
      if (!req.file) {
        return responseHelper.badRequest(
          res,
          "No file provided. Please upload a file."
        );
      }

      // Check authorization
      const authCheck = authorizationHelper.canUploadType(req, type);
      if (!authCheck.canUpload) {
        return responseHelper.unauthorized(res, authCheck.error);
      }

      // Process file upload
      const result = await uploadService.processFileUpload({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        type,
        alt,
        userId: authorizationHelper.getUserId(req),
      });

      return responseHelper.uploadSuccess(res, result);
    } catch (error) {
      handleUploadError(res, error, "File upload");
    }
  }

  // DELETE /upload/:id - Delete uploaded file
  async deleteFile(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return responseHelper.badRequest(
          res,
          UPLOAD_ERROR_MESSAGES.FILE_ID_REQUIRED
        );
      }

      // Check authorization
      const authCheck = authorizationHelper.canDeleteFile(req);
      if (!authCheck.canDelete) {
        return responseHelper.unauthorized(res, authCheck.error);
      }

      // Delete file
      await uploadService.deleteFile(id);

      return responseHelper.deleteSuccess(res);
    } catch (error) {
      logger.error("File deletion error:", error);

      if (error instanceof Error) {
        if (error.message === "File not found") {
          return responseHelper.notFound(
            res,
            UPLOAD_ERROR_MESSAGES.FILE_NOT_FOUND
          );
        }
        return responseHelper.badRequest(res, error.message);
      }

      return responseHelper.serverError(
        res,
        UPLOAD_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      );
    }
  }

  // GET /upload/:id - Get file information
  async getFileInfo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return responseHelper.badRequest(
          res,
          UPLOAD_ERROR_MESSAGES.FILE_ID_REQUIRED
        );
      }

      const picture = await uploadService.getFileInfo(id);

      return responseHelper.success(
        res,
        UPLOAD_SUCCESS_MESSAGES.FILE_INFO_RETRIEVED,
        {
          id: picture.id,
          url: picture.url,
          alt: picture.alt,
          type: picture.type,
          sizeKB: picture.sizeKB,
          uploadedAt: picture.uploadedAt,
          createdAt: picture.createdAt,
          updatedAt: picture.updatedAt,
        }
      );
    } catch (error) {
      logger.error("Get file info error:", error);

      if (error instanceof Error && error.message === "File not found") {
        return responseHelper.notFound(res, "File");
      }

      return responseHelper.serverError(res);
    }
  }

  // GET /upload - List uploaded files (with pagination)
  async listFiles(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;
      const userId = authorizationHelper.getUserId(req);

      const result = await uploadService.listFiles({
        page,
        limit,
        type,
        userId,
      });

      return responseHelper.paginated(
        res,
        UPLOAD_SUCCESS_MESSAGES.FILES_LISTED,
        result.pictures,
        result.pagination
      );
    } catch (error) {
      logger.error("List files error:", error);
      return responseHelper.serverError(res);
    }
  }
}

// Middleware wrapper for multer
export const uploadMiddleware = multerConfigService.getUploadMiddleware();

export default new UploadController();
