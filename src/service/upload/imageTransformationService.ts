import { FileType } from "../../interfaces";

class ImageTransformationService {
  private readonly IMAGE_FORMATS = ["jpg", "jpeg", "png", "gif", "webp"];

  // Get transformation settings for different file types
  getTransformationSettings(type: FileType): any[] {
    switch (type) {
      case "profile":
        return [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ];

      case "property":
        return [
          { width: 1200, height: 800, crop: "fill" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ];

      case "room":
        return [
          { width: 800, height: 600, crop: "fill" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ];

      case "proof":
        return [
          { width: 1000, height: 1000, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ];

      default:
        return [{ quality: "auto:good" }, { fetch_format: "auto" }];
    }
  }

  // Check if file should be transformed (images only)
  shouldTransform(filename: string): boolean {
    const extension = filename.split(".").pop()?.toLowerCase();
    return this.IMAGE_FORMATS.includes(extension || "");
  }

  // Get resource type for upload
  getResourceType(filename: string): string {
    const isImage = this.shouldTransform(filename);
    return isImage ? "image" : "raw";
  }

  // Get folder path for file type
  getFolderPath(type: FileType): string {
    return `prorent/${type}s`;
  }
}

export default new ImageTransformationService();
