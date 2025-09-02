"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterAndSortProperties = filterAndSortProperties;
function filterAndSortProperties(propertyMap, // Input always has full data
roomTypeMap, // Input always has full data
reservations, filters, options // Ensure fetchAllData is part of options for typing
) {
    // 1. Start with all properties from the map (which includes all owner's properties)
    let properties = Array.from(propertyMap.values());
    // 2. --- Apply propertyId filter ---
    if (filters.propertyId) {
        properties = properties.filter(p => p.property.id === filters.propertyId);
    }
    // --- END OF propertyId filter ---
    // 3. Apply other property-level filters
    if (filters.search && !filters.propertySearch) {
        const searchLower = filters.search.toLowerCase();
        properties = properties.filter(p => p.property.name.toLowerCase().includes(searchLower) ||
            (p.property.address || '').toLowerCase().includes(searchLower) ||
            (p.property.city || '').toLowerCase().includes(searchLower) ||
            (p.property.province || '').toLowerCase().includes(searchLower));
    }
    if (filters.propertySearch) {
        const searchLower = filters.propertySearch.toLowerCase();
        properties = properties.filter(p => p.property.name.toLowerCase().includes(searchLower) ||
            (p.property.address || '').toLowerCase().includes(searchLower) ||
            (p.property.city || '').toLowerCase().includes(searchLower) ||
            (p.property.province || '').toLowerCase().includes(searchLower));
    }
    if (filters.city) {
        properties = properties.filter(p => p.property.city === filters.city);
    }
    if (filters.province) {
        properties = properties.filter(p => p.property.province === filters.province);
    }
    // 4. Apply room-type-specific filters
    if (filters.roomTypeId || filters.roomTypeSearch) {
        properties = properties.map(propSummary => {
            let filteredRoomTypes = propSummary.roomTypes;
            if (filters.roomTypeId) {
                filteredRoomTypes = filteredRoomTypes.filter(rt => rt.roomType.id === filters.roomTypeId);
            }
            if (filters.roomTypeSearch) {
                const rtSearchLower = filters.roomTypeSearch.toLowerCase();
                filteredRoomTypes = filteredRoomTypes.filter(rt => rt.roomType.name.toLowerCase().includes(rtSearchLower));
            }
            return Object.assign(Object.assign({}, propSummary), { roomTypes: filteredRoomTypes });
        });
        properties = properties.filter(prop => prop.roomTypes.length > 0);
    }
    // 5. Sort the properties list
    properties.sort(getSortComparator(options.sortBy, options.sortDir));
    // 6. Paginate the properties list
    const { page = 1, pageSize = 10 } = options;
    const total = properties.length;
    const totalPages = Math.ceil(total / pageSize);
    const paginatedPropertiesFull = properties.slice((page - 1) * pageSize, page * pageSize);
    // --- Check for fetchAllData flag and conditionally process the paginated properties ---
    const fetchAllData = typeof options.fetchAllData === 'boolean' ? options.fetchAllData : false;
    let finalPaginatedProperties; // We'll use the conditional type for the actual return
    if (fetchAllData) {
        // If fetchAllData is true, return the full property objects with reservationListItems
        finalPaginatedProperties = paginatedPropertiesFull;
    }
    else {
        // If fetchAllData is false, omit reservationListItems (and related fields) from roomTypes
        finalPaginatedProperties = paginatedPropertiesFull.map(prop => (Object.assign(Object.assign({}, prop), { roomTypes: prop.roomTypes.map(rt => {
                // For each room type, omit reservationListItems, pagination, and totalAmount
                const { reservationListItems, pagination } = rt, rest = __rest(rt, ["reservationListItems", "pagination"]);
                return rest; // Return the room type object without the omitted fields
            }) })));
    }
    // --- End of conditional processing ---
    return {
        paginatedProperties: finalPaginatedProperties, // Type assertion
        total,
        totalPages
    };
}
function getSortComparator(sortBy = 'name', sortDir = 'asc') {
    return (a, b) => {
        let aVal = 0;
        let bVal = 0;
        switch (sortBy) {
            case 'revenue':
                aVal = a.summary.revenue.actual;
                bVal = b.summary.revenue.actual;
                break;
            case 'confirmed':
                aVal = a.summary.counts.CONFIRMED;
                bVal = b.summary.counts.CONFIRMED;
                break;
            case 'pending':
                aVal = (a.summary.counts.PENDING_PAYMENT || 0) + (a.summary.counts.PENDING_CONFIRMATION || 0);
                bVal = (b.summary.counts.PENDING_PAYMENT || 0) + (b.summary.counts.PENDING_CONFIRMATION || 0);
                break;
            case 'city':
                return sortDir === 'asc'
                    ? (a.property.city || '').localeCompare(b.property.city || '')
                    : (b.property.city || '').localeCompare(a.property.city || '');
            case 'province':
                return sortDir === 'asc'
                    ? (a.property.province || '').localeCompare(b.property.province || '')
                    : (b.property.province || '').localeCompare(a.property.province || '');
            case 'address':
                return sortDir === 'asc'
                    ? (a.property.address || '').localeCompare(b.property.address || '')
                    : (b.property.address || '').localeCompare(a.property.address || '');
            default:
                return sortDir === 'asc'
                    ? a.property.name.localeCompare(b.property.name)
                    : b.property.name.localeCompare(a.property.name);
        }
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    };
}
