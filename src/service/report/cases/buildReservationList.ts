// service/report/cases/buildReservationList.ts
import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';

export function buildReservationList (
   roomTypeMap: Map<string, ReportInterface.RoomTypeWithAvailability>, // This map contains ALL room types for the owner
   reservations: any[],
   options: ReportInterface.ReportOptions,
   filters: ReportInterface.ReportFilters
) {
   const { reservationPage = 1, reservationPageSize = 10 } = options;
   const { roomTypeSearch, invoiceNumber } = filters;
   const listByRoomType: Record<string, any[]> = {};

   // Group reservations by roomTypeId
   for (const r of reservations) {
      const rtid = r.roomTypeId;
      if (!listByRoomType[rtid]) {
         listByRoomType[rtid] = [];
      }

      // Apply filters that affect which reservations are included for a room type
      // These filters determine the content of reservationListItems for each room type
      if (roomTypeSearch && !r.RoomType.name.toLowerCase().includes(roomTypeSearch.toLowerCase())) {
         continue; // Skip reservation if it doesn't match roomTypeSearch
      }
      if (invoiceNumber && r.payment?.invoiceNumber !== invoiceNumber) {
         continue; // Skip reservation if it doesn't match invoiceNumber
      }

      // Add the reservation to the list for its room type

      listByRoomType[rtid].push({
         id: r.id,
         userId: r.userId,
         roomId: r.roomId,
         startDate: r.startDate,
         endDate: r.endDate,
         orderStatus: r.orderStatus,
         paymentAmount: r.payment?.amount || 0,
         invoiceNumber: r.payment?.invoiceNumber || null,
         user: {
            email: r.User.email,
            firstName: r.User?.profile?.firstName || null,
            lastName: r.User?.profile?.lastName || null
         }
      });
   }

   // Populate reservationListItems, pagination, and totalAmount for EACH room type in roomTypeMap
   // This loop ensures that even room types with 0 matching reservations get an empty list assigned
   for (const [ rtid, roomType ] of roomTypeMap.entries()) {
      const items = listByRoomType[rtid] || []; // Get items or default to empty array
      const total = items.length;

      let paginatedItems: any[], finalPagination: ReportInterface.Pagination;

      // --- Check for fetchAllData flag ---
      const fetchAllData = typeof options.fetchAllData === 'boolean' ? options.fetchAllData : false;

      // --- Check for fetchAllData flag ---
      if (fetchAllData) {
         // If fetchAllData is true, include ALL items for this room type
         paginatedItems = items;
         // Update pagination info to reflect the full set
         finalPagination = {
            page: 1, // Conceptually, it's all on "page 1"
            pageSize: total, // The size is effectively the total count
            total,
            totalPages: 1 // Only one page when fetching all
         };
      } else {
         // Apply standard pagination logic
         const totalPages = Math.ceil(total / reservationPageSize);
         // Determine page - handle object format for per-room-type pages if needed
         const currentPage = typeof reservationPage === 'object' ? reservationPage[rtid] || 1 : reservationPage;
         const start = (currentPage - 1) * reservationPageSize;
         const end = start + reservationPageSize;

         // Assign the paginated list
         paginatedItems = items.slice(start, end);

         finalPagination = {
            page: currentPage,
            pageSize: reservationPageSize,
            total,
            totalPages
         };
      }
      // --- End of fetchAllData check ---

      // Assign the (potentially paginated or full) list, the final pagination info, and total amount to the room type object
      roomType.reservationListItems = paginatedItems;
      roomType.pagination = finalPagination;
      roomType.totalAmount = items.reduce((sum, r) => sum + (r.paymentAmount || 0), 0);
   }
}
