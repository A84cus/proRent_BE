import {
  RoomCreateData,
  RoomUpdateData,
} from "../../interfaces/property/room.interface";

class RoomValidationHelper {
  // Validate room creation data
  static validateCreateRoomData(data: any): {
    isValid: boolean;
    errors: string[];
    cleanData?: RoomCreateData;
  } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.propertyId || typeof data.propertyId !== "string") {
      errors.push("Property ID is required and must be a string");
    }

    if (!data.roomTypeId || typeof data.roomTypeId !== "string") {
      errors.push("Room Type ID is required and must be a string");
    }

    // Optional fields validation
    if (data.name !== undefined && typeof data.name !== "string") {
      errors.push("Room name must be a string");
    }

    if (data.pictures && !Array.isArray(data.pictures)) {
      errors.push("Pictures must be an array of picture IDs");
    }

    if (
      data.pictures &&
      data.pictures.some((pic: unknown) => typeof pic !== "string")
    ) {
      errors.push("All picture IDs must be strings");
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      cleanData: {
        roomTypeId: data.roomTypeId.trim(),
        propertyId: data.propertyId.trim(),
        name: data.name?.trim(),
        pictures: data.pictures || [],
      },
    };
  }

  // Validate room update data
  static validateUpdateRoomData(data: any): {
    isValid: boolean;
    errors: string[];
    cleanData?: RoomUpdateData;
  } {
    const errors: string[] = [];
    const updateData: RoomUpdateData = {};

    // name validation
    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        errors.push("Name must be a non-empty string");
      } else {
        updateData.name = data.name.trim();
      }
    }

    // isAvailable validation
    if (data.isAvailable !== undefined) {
      if (typeof data.isAvailable !== "boolean") {
        errors.push("isAvailable must be a boolean");
      } else {
        updateData.isAvailable = data.isAvailable;
      }
    }

    // pictures validation
    if (data.pictures !== undefined) {
      if (!Array.isArray(data.pictures)) {
        errors.push("Pictures must be an array of picture IDs");
      } else if (
        data.pictures.some((pic: unknown) => typeof pic !== "string")
      ) {
        errors.push("All picture IDs must be strings");
      } else {
        updateData.pictures = data.pictures;
      }
    }

    // roomTypeId validation
    if (data.roomTypeId !== undefined) {
      if (
        typeof data.roomTypeId !== "string" ||
        data.roomTypeId.trim().length === 0
      ) {
        errors.push("roomTypeId must be a non-empty string");
      } else {
        updateData.roomTypeId = data.roomTypeId.trim();
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: [],
      cleanData: updateData,
    };
  }

  // Validate room ID parameter
  static validateRoomId(roomId: any): {
    isValid: boolean;
    errors: string[];
    error?: string;
    cleanId?: string;
  } {
    const errors: string[] = [];

    if (!roomId || typeof roomId !== "string" || roomId.trim().length === 0) {
      errors.push("Room ID is required and must be a non-empty string");
      return {
        isValid: false,
        errors,
        error: errors[0],
      };
    }

    return {
      isValid: true,
      errors: [],
      cleanId: roomId.trim(),
    };
  }

  // Validate property ID parameter
  static validatePropertyId(propertyId: any): {
    isValid: boolean;
    errors: string[];
    error?: string;
    cleanId?: string;
  } {
    const errors: string[] = [];

    if (
      !propertyId ||
      typeof propertyId !== "string" ||
      propertyId.trim().length === 0
    ) {
      errors.push("Property ID is required and must be a non-empty string");
      return {
        isValid: false,
        errors,
        error: errors[0],
      };
    }

    return {
      isValid: true,
      errors: [],
      cleanId: propertyId.trim(),
    };
  }
}

export default RoomValidationHelper;
