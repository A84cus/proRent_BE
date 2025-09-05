// service/report/cases/countUniqueCustomers.ts
export function computeUniqueCustomers (roomTypeMap: Map<string, any>, reservations: any[]) {
   const customerSetByRoomType = reservations.reduce((acc, r) => {
      if (!acc[r.roomTypeId]) {
         acc[r.roomTypeId] = new Set();
      }
      acc[r.roomTypeId].add(r.userId);
      return acc;
   }, {} as Record<string, Set<string>>);

   for (const [ rtid, userIds ] of Object.entries(customerSetByRoomType)) {
      if (roomTypeMap.has(rtid)) {
         roomTypeMap.get(rtid)!.uniqueCustomers = (userIds as Set<string>).size;
      }
   }
}
