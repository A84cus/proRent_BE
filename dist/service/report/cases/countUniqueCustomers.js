"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeUniqueCustomers = computeUniqueCustomers;
// service/report/cases/countUniqueCustomers.ts
function computeUniqueCustomers(roomTypeMap, reservations) {
    const customerSetByRoomType = reservations.reduce((acc, r) => {
        if (!acc[r.roomTypeId]) {
            acc[r.roomTypeId] = new Set();
        }
        acc[r.roomTypeId].add(r.userId);
        return acc;
    }, {});
    for (const [rtid, userIds] of Object.entries(customerSetByRoomType)) {
        if (roomTypeMap.has(rtid)) {
            roomTypeMap.get(rtid).uniqueCustomers = userIds.size;
        }
    }
}
