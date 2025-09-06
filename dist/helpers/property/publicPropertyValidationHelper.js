"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_1 = require("../../constants/controllers/property");
class PublicPropertyValidationHelper {
    /**
     * Validate property ID parameter
     */
    static validatePropertyId(id) {
        if (!id) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PROPERTY_ID_REQUIRED,
            };
        }
        return { isValid: true };
    }
    /**
     * Validate search query parameters
     */
    static validateSearchQuery(queryParams) {
        const { search, category, province, city, location, minPrice, maxPrice, capacity, sortBy, sortOrder, page, limit, } = queryParams;
        // Parse and set defaults
        const searchQuery = {
            search: search ? String(search).trim() : undefined,
            category: category ? String(category).trim() : undefined,
            province: province ? String(province).trim() : undefined,
            city: city ? String(city).trim() : undefined,
            location: location ? String(location).trim() : undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            capacity: capacity ? Number(capacity) : undefined,
            sortBy: sortBy
                ? String(sortBy)
                : "createdAt",
            sortOrder: sortOrder ? String(sortOrder) : "desc",
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        };
        // Price validations
        if (searchQuery.minPrice !== undefined && searchQuery.minPrice < 0) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.NEGATIVE_MIN_PRICE,
            };
        }
        if (searchQuery.maxPrice !== undefined && searchQuery.maxPrice < 0) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.NEGATIVE_MAX_PRICE,
            };
        }
        if (searchQuery.minPrice !== undefined &&
            searchQuery.maxPrice !== undefined &&
            searchQuery.minPrice > searchQuery.maxPrice) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.MIN_PRICE_GREATER_THAN_MAX,
            };
        }
        // Capacity validation
        if (searchQuery.capacity !== undefined && searchQuery.capacity < 1) {
            return {
                isValid: false,
                error: "Capacity must be at least 1",
            };
        }
        // Sort validations
        if (!["createdAt", "name", "pricing", "price", "capacity"].includes(searchQuery.sortBy)) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_SORT_BY,
            };
        }
        if (!["asc", "desc"].includes(searchQuery.sortOrder)) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_SORT_ORDER_VALUE,
            };
        }
        // Pagination validations
        if (searchQuery.page < 1) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.PAGE_MUST_BE_AT_LEAST_ONE,
            };
        }
        if (searchQuery.limit < 1 || searchQuery.limit > 100) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_LIMIT_RANGE,
            };
        }
        return {
            isValid: true,
            query: searchQuery,
        };
    }
    /**
     * Validate calendar query parameters
     */
    static validateCalendarQuery(queryParams) {
        const { month, year } = queryParams;
        if (!month || !year) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_VALUES,
            };
        }
        const monthStr = String(month);
        const yearStr = String(year);
        // Validate month format (1-12)
        const monthNum = parseInt(monthStr);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT,
            };
        }
        // Validate year format (4 digits)
        const yearNum = parseInt(yearStr);
        if (isNaN(yearNum) || yearStr.length !== 4) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT,
            };
        }
        return {
            isValid: true,
            query: {
                month: monthStr.padStart(2, "0"),
                year: yearStr,
            },
        };
    }
    /**
     * Validate room query parameters
     */
    static validateRoomQuery(queryParams) {
        const { checkin, checkout, guests } = queryParams;
        const roomQuery = {
            checkin: checkin ? String(checkin) : undefined,
            checkout: checkout ? String(checkout) : undefined,
            guests: guests ? Number(guests) : undefined,
        };
        // Date format validation if provided
        if (roomQuery.checkin) {
            const checkinDate = new Date(roomQuery.checkin);
            if (isNaN(checkinDate.getTime())) {
                return {
                    isValid: false,
                    error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT,
                };
            }
        }
        if (roomQuery.checkout) {
            const checkoutDate = new Date(roomQuery.checkout);
            if (isNaN(checkoutDate.getTime())) {
                return {
                    isValid: false,
                    error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_FORMAT,
                };
            }
        }
        // Check if checkin is before checkout
        if (roomQuery.checkin && roomQuery.checkout) {
            const checkinDate = new Date(roomQuery.checkin);
            const checkoutDate = new Date(roomQuery.checkout);
            if (checkinDate >= checkoutDate) {
                return {
                    isValid: false,
                    error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.START_DATE_BEFORE_END_DATE,
                };
            }
        }
        // Guests validation
        if (roomQuery.guests !== undefined && roomQuery.guests < 1) {
            return {
                isValid: false,
                error: property_1.PUBLIC_PROPERTY_ERROR_MESSAGES.INVALID_DATE_VALUES,
            };
        }
        return {
            isValid: true,
            query: roomQuery,
        };
    }
}
exports.default = PublicPropertyValidationHelper;
