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
class PropertyRepository {
    // Get all properties by owner ID
    findAllByOwner(ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.property.findMany({
                where: { OwnerId: ownerId },
                include: {
                    category: true,
                    location: {
                        include: {
                            city: {
                                include: {
                                    province: true,
                                },
                            },
                        },
                    },
                    mainPicture: true,
                    gallery: {
                        include: {
                            picture: true,
                        },
                    },
                    rooms: {
                        include: {
                            roomType: true,
                        },
                    },
                    roomTypes: true,
                    _count: {
                        select: {
                            rooms: true,
                            Reservation: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        });
    }
    // Find property by ID with full details
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.property.findUnique({
                where: { id },
                include: {
                    category: true,
                    location: {
                        include: {
                            city: {
                                include: {
                                    province: true,
                                },
                            },
                        },
                    },
                    Owner: {
                        select: {
                            id: true,
                            email: true,
                            profile: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                    mainPicture: true,
                    gallery: {
                        include: {
                            picture: true,
                        },
                    },
                    rooms: {
                        include: {
                            roomType: true,
                            gallery: {
                                include: {
                                    picture: true,
                                },
                            },
                        },
                    },
                    roomTypes: true,
                    _count: {
                        select: {
                            rooms: true,
                            Reservation: true,
                        },
                    },
                },
            });
        });
    }
    // Find property by ID and owner (for authorization)
    findByIdAndOwner(id, ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.property.findFirst({
                where: {
                    id,
                    OwnerId: ownerId,
                },
                include: {
                    category: true,
                    location: {
                        include: {
                            city: {
                                include: {
                                    province: true,
                                },
                            },
                        },
                    },
                    mainPicture: true,
                    gallery: {
                        include: {
                            picture: true,
                        },
                    },
                    rooms: {
                        include: {
                            roomType: true,
                        },
                    },
                    roomTypes: true,
                },
            });
        });
    }
    // Create new property
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.property.create({
                data,
                include: {
                    category: true,
                    location: {
                        include: {
                            city: {
                                include: {
                                    province: true,
                                },
                            },
                        },
                    },
                    mainPicture: true,
                },
            });
        });
    }
    // Update property
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.property.update({
                where: { id },
                data,
                include: {
                    category: true,
                    location: {
                        include: {
                            city: {
                                include: {
                                    province: true,
                                },
                            },
                        },
                    },
                    mainPicture: true,
                    gallery: {
                        include: {
                            picture: true,
                        },
                    },
                },
            });
        });
    }
    // Delete property
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.property.delete({
                where: { id },
            });
        });
    }
    // Check if property has active bookings
    hasActiveBookings(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeBookingCount = yield prisma.reservation.count({
                where: {
                    propertyId,
                    orderStatus: {
                        in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"],
                    },
                    deletedAt: null,
                },
            });
            return activeBookingCount > 0;
        });
    }
    // Get or create location
    getOrCreateLocation(address, cityId, latitude, longitude) {
        return __awaiter(this, void 0, void 0, function* () {
            // First try to find existing location
            const existingLocation = yield prisma.location.findFirst({
                where: {
                    address,
                    cityId,
                },
            });
            if (existingLocation) {
                // Update existing location with new lat/lng if provided
                if (latitude !== undefined || longitude !== undefined) {
                    yield prisma.location.update({
                        where: { id: existingLocation.id },
                        data: {
                            latitude: latitude !== undefined &&
                                latitude !== null &&
                                latitude.trim() !== ""
                                ? latitude
                                : existingLocation.latitude,
                            longitude: longitude !== undefined &&
                                longitude !== null &&
                                longitude.trim() !== ""
                                ? longitude
                                : existingLocation.longitude,
                        },
                    });
                }
                return existingLocation.id;
            }
            // Create new location
            const newLocation = yield prisma.location.create({
                data: {
                    name: address, // Use address as name for now
                    address,
                    cityId,
                    latitude: latitude !== undefined && latitude !== null && latitude.trim() !== ""
                        ? latitude
                        : null,
                    longitude: longitude !== undefined &&
                        longitude !== null &&
                        longitude.trim() !== ""
                        ? longitude
                        : null,
                },
            });
            return newLocation.id;
        });
    }
    // Find city by name and province
    findCityByNameAndProvince(cityName, provinceName) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.city.findFirst({
                where: {
                    name: {
                        equals: cityName,
                        mode: "insensitive",
                    },
                    province: {
                        name: {
                            equals: provinceName,
                            mode: "insensitive",
                        },
                    },
                },
                include: {
                    province: true,
                },
            });
        });
    }
    // Create city if not exists
    createCityIfNotExists(cityName, provinceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCity = yield prisma.city.findFirst({
                where: {
                    name: {
                        equals: cityName,
                        mode: "insensitive",
                    },
                    provinceId,
                },
            });
            if (existingCity) {
                return existingCity.id;
            }
            const newCity = yield prisma.city.create({
                data: {
                    name: cityName,
                    provinceId,
                },
            });
            return newCity.id;
        });
    }
    // Find or create province
    findOrCreateProvince(provinceName) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingProvince = yield prisma.province.findFirst({
                where: {
                    name: {
                        equals: provinceName,
                        mode: "insensitive",
                    },
                },
            });
            if (existingProvince) {
                return existingProvince.id;
            }
            const newProvince = yield prisma.province.create({
                data: {
                    name: provinceName,
                },
            });
            return newProvince.id;
        });
    }
}
exports.default = new PropertyRepository();
