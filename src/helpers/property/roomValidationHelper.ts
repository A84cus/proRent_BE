import { RoomCreateData, RoomUpdateData } from "../../interfaces";

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

    if (
      !data.name ||
      typeof data.name !== "string" ||
      data.name.trim().length === 0
    ) {
      errors.push("Room name is required and must be a non-empty string");
    }

    if (
      !data.roomTypeName ||
      typeof data.roomTypeName !== "string" ||
      data.roomTypeName.trim().length === 0
    ) {
      errors.push("Room type name is required and must be a non-empty string");
    }

    if (
      !data.basePrice ||
      typeof data.basePrice !== "number" ||
      data.basePrice <= 0
    ) {
      errors.push("Base price is required and must be a number greater than 0");
    }

    if (
      !data.capacity ||
      typeof data.capacity !== "number" ||
      data.capacity < 1
    ) {
      errors.push("Capacity is required and must be a number greater than 0");
    }

    // Optional fields validation
    if (
      data.description !== undefined &&
      typeof data.description !== "string"
    ) {
      errors.push("Description must be a string");
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
        propertyId: data.propertyId.trim(),
        name: data.name.trim(),
        roomTypeName: data.roomTypeName.trim(),
        description: data.description?.trim(),
        basePrice: Number(data.basePrice),
        capacity: Math.floor(Number(data.capacity)),
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

    // Optional field validations (only include if provided)
    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        errors.push("Name must be a non-empty string");
      } else {
        updateData.name = data.name.trim();
      }
    }

    if (data.description !== undefined) {
      if (typeof data.description !== "string") {
        errors.push("Description must be a string");
      } else {
        updateData.description = data.description.trim();
      }
    }

    if (data.basePrice !== undefined) {
      if (typeof data.basePrice !== "number" || data.basePrice <= 0) {
        errors.push("Base price must be a number greater than 0");
      } else {
        updateData.basePrice = Number(data.basePrice);
      }
    }

    if (data.capacity !== undefined) {
      if (typeof data.capacity !== "number" || data.capacity < 1) {
        errors.push("Capacity must be a number greater than 0");
      } else {
        updateData.capacity = Math.floor(Number(data.capacity));
      }
    }

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
  static validateRoomId(roomId: unknown): {
    isValid: boolean;
    error?: string;
    cleanId?: string;
  } {
    if (!roomId || typeof roomId !== "string" || roomId.trim().length === 0) {
      return {
        isValid: false,
        error: "Room ID is required and must be a valid string",
      };
    }

    return {
      isValid: true,
      cleanId: roomId.trim(),
    };
  }

  // Validate property ID parameter
  static validatePropertyId(propertyId: unknown): {
    isValid: boolean;
    error?: string;
    cleanId?: string;
  } {
    if (
      !propertyId ||
      typeof propertyId !== "string" ||
      propertyId.trim().length === 0
    ) {
      return {
        isValid: false,
        error: "Property ID is required as query parameter",
      };
    }

    return {
      isValid: true,
      cleanId: propertyId.trim(),
    };
  }
}

export default RoomValidationHelper;
