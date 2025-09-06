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
class PublicPropertyRepository {
    // Search properties with filters and pagination
    searchProperties(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const page = params.page || 1;
            const limit = params.limit || 10;
            const skip = (page - 1) * limit;
            // Build where clause
            const where = {};
            // Search in property name, description, and location
            if (params.search) {
                where.OR = [
                    { name: { contains: params.search, mode: "insensitive" } },
                    { description: { contains: params.search, mode: "insensitive" } },
                    {
                        location: {
                            OR: [
                                { name: { contains: params.search, mode: "insensitive" } },
                                { address: { contains: params.search, mode: "insensitive" } },
                                {
                                    city: {
                                        name: { contains: params.search, mode: "insensitive" },
                                    },
                                },
                                {
                                    city: {
                                        province: {
                                            name: { contains: params.search, mode: "insensitive" },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ];
            }
            // Filter by category
            if (params.category) {
                where.category = {
                    name: { contains: params.category, mode: "insensitive" },
                };
            }
            // Filter by city
            if (params.city) {
                where.location = {
                    city: {
                        name: { contains: params.city, mode: "insensitive" },
                    },
                };
            }
            // Filter by province
            if (params.province) {
                where.location = Object.assign(Object.assign({}, where.location), { city: Object.assign(Object.assign({}, (((_a = where.location) === null || _a === void 0 ? void 0 : _a.city) || {})), { province: {
                            name: { contains: params.province, mode: "insensitive" },
                        } }) });
            }
            // Build order by
            let orderBy = {
                createdAt: "desc",
            };
            if (params.sortBy && params.sortOrder) {
                switch (params.sortBy) {
                    case "name":
                        orderBy = { name: params.sortOrder };
                        break;
                    case "createdAt":
                        orderBy = { createdAt: params.sortOrder };
                        break;
                    case "price":
                    case "capacity":
                        // For price/capacity sorting, we'll handle this after fetching data
                        orderBy = { name: "asc" };
                        break;
                }
            }
            const [propertiesRaw, total] = yield Promise.all([
                prisma_1.default.property.findMany({
                    where,
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
                        roomTypes: {
                            select: {
                                id: true,
                                name: true,
                                basePrice: true,
                                capacity: true,
                                totalQuantity: true,
                            },
                            orderBy: { basePrice: "asc" },
                        },
                        _count: {
                            select: {
                                rooms: true,
                            },
                        },
                    },
                    orderBy,
                    skip,
                    take: limit,
                }),
                prisma_1.default.property.count({ where }),
            ]);
            let properties = propertiesRaw;
            // Filter by price range
            if (params.minPrice || params.maxPrice) {
                properties = properties.filter((property) => {
                    if (property.roomTypes.length === 0)
                        return false;
                    const minPrice = Math.min(...property.roomTypes.map((rt) => Number(rt.basePrice)));
                    const maxPrice = Math.max(...property.roomTypes.map((rt) => Number(rt.basePrice)));
                    let matchesPrice = true;
                    if (params.minPrice && minPrice < params.minPrice)
                        matchesPrice = false;
                    if (params.maxPrice && maxPrice > params.maxPrice)
                        matchesPrice = false;
                    return matchesPrice;
                });
            }
            // Filter by capacity
            if (params.capacity) {
                properties = properties.filter((property) => {
                    if (property.roomTypes.length === 0)
                        return false;
                    const maxCapacity = Math.max(...property.roomTypes.map((rt) => rt.capacity));
                    return maxCapacity >= params.capacity;
                });
            }
            // Sort by price or capacity if specified
            if (params.sortBy && params.sortOrder) {
                if (params.sortBy === "price") {
                    properties = properties.sort((a, b) => {
                        const aMinPrice = a.roomTypes.length > 0
                            ? Math.min(...a.roomTypes.map((rt) => Number(rt.basePrice)))
                            : 0;
                        const bMinPrice = b.roomTypes.length > 0
                            ? Math.min(...b.roomTypes.map((rt) => Number(rt.basePrice)))
                            : 0;
                        return params.sortOrder === "asc"
                            ? aMinPrice - bMinPrice
                            : bMinPrice - aMinPrice;
                    });
                }
                else if (params.sortBy === "capacity") {
                    properties = properties.sort((a, b) => {
                        const aMaxCapacity = a.roomTypes.length > 0
                            ? Math.max(...a.roomTypes.map((rt) => rt.capacity))
                            : 0;
                        const bMaxCapacity = b.roomTypes.length > 0
                            ? Math.max(...b.roomTypes.map((rt) => rt.capacity))
                            : 0;
                        return params.sortOrder === "asc"
                            ? aMaxCapacity - bMaxCapacity
                            : bMaxCapacity - aMaxCapacity;
                    });
                }
            }
            const totalPages = Math.ceil(total / limit);
            return {
                properties,
                total,
                page,
                limit,
                totalPages,
            };
        });
    }
    // Get property by ID for public view
    findByIdPublic(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.property.findUnique({
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
                    roomTypes: {
                        include: {
                            peakRates: {
                                where: {
                                    endDate: { gte: new Date() },
                                },
                                orderBy: { startDate: "asc" },
                            },
                        },
                    },
                },
            });
        });
    }
    // Get room types for a property
    findRoomTypesByProperty(propertyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.roomType.findMany({
                where: { propertyId },
                include: {
                    rooms: {
                        select: {
                            id: true,
                            name: true,
                            isAvailable: true,
                        },
                    },
                    peakRates: {
                        where: {
                            endDate: { gte: new Date() },
                        },
                        orderBy: { startDate: "asc" },
                    },
                    _count: {
                        select: {
                            rooms: true,
                        },
                    },
                },
                orderBy: { basePrice: "asc" },
            });
        });
    }
    // Get daily pricing and availability for property
    getDailyPricingAndAvailability(propertyId, days) {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + days);
            // Get all room types for the property
            const roomTypes = yield prisma_1.default.roomType.findMany({
                where: { propertyId },
                include: {
                    peakRates: {
                        where: {
                            OR: [
                                {
                                    AND: [
                                        { startDate: { lte: endDate } },
                                        { endDate: { gte: startDate } },
                                    ],
                                },
                            ],
                        },
                    },
                    availabilities: {
                        where: {
                            date: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                    },
                    rooms: {
                        include: {
                            availabilities: {
                                where: {
                                    date: {
                                        gte: startDate,
                                        lte: endDate,
                                    },
                                },
                            },
                            reservations: {
                                where: {
                                    orderStatus: {
                                        in: ["PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED"],
                                    },
                                    deletedAt: null,
                                    OR: [
                                        {
                                            AND: [
                                                { startDate: { lte: endDate } },
                                                { endDate: { gte: startDate } },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            });
            // Build daily data
            const dailyData = [];
            for (let i = 0; i < days; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                const roomTypeData = roomTypes.map((roomType) => {
                    // Calculate pricing for this date
                    const applicablePeakRate = roomType.peakRates.find((rate) => currentDate >= new Date(rate.startDate) &&
                        currentDate <= new Date(rate.endDate));
                    let finalPrice = Number(roomType.basePrice);
                    if (applicablePeakRate) {
                        if (applicablePeakRate.rateType === "PERCENTAGE") {
                            finalPrice =
                                finalPrice * (1 + Number(applicablePeakRate.value) / 100);
                        }
                        else {
                            finalPrice = finalPrice + Number(applicablePeakRate.value);
                        }
                    }
                    // Calculate availability
                    const roomTypeAvailability = roomType.availabilities.find((av) => av.date.toDateString() === currentDate.toDateString());
                    let totalAvailable = roomType.totalQuantity;
                    if (roomTypeAvailability) {
                        totalAvailable = roomTypeAvailability.availableCount;
                    }
                    // Subtract rooms with reservations
                    const reservedRooms = roomType.rooms.filter((room) => room.reservations.some((res) => currentDate >= new Date(res.startDate) &&
                        currentDate <= new Date(res.endDate))).length;
                    totalAvailable = Math.max(0, totalAvailable - reservedRooms);
                    return {
                        roomTypeId: roomType.id,
                        roomTypeName: roomType.name,
                        basePrice: Number(roomType.basePrice),
                        finalPrice: Math.round(finalPrice * 100) / 100,
                        available: totalAvailable,
                        peakRate: applicablePeakRate
                            ? {
                                name: applicablePeakRate.name,
                                value: Number(applicablePeakRate.value),
                                rateType: applicablePeakRate.rateType,
                            }
                            : null,
                    };
                });
                dailyData.push({
                    date: currentDate.toISOString().split("T")[0],
                    roomTypes: roomTypeData,
                });
            }
            return dailyData;
        });
    }
    // Get all categories for filtering
    findAllCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.category.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    _count: {
                        select: {
                            properties: true,
                        },
                    },
                },
                orderBy: { name: "asc" },
            });
        });
    }
    // Find room type by ID (public access)
    findRoomTypeById(roomTypeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.roomType.findUnique({
                where: { id: roomTypeId },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    basePrice: true,
                    capacity: true,
                    totalQuantity: true,
                    isWholeUnit: true,
                    property: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        });
    }
}
exports.default = new PublicPropertyRepository();
