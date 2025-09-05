// service/report/cases/filterAndSortProperties.ts
import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';
import { aggregateSummaries } from '../utils/aggregateSummaries';

// Define a helper type for the conditional return type
// If T is true, it returns PropertySummary[].
// If T is false, it returns PropertySummaryBase[] where reservationListItems are omitted from roomTypes.
type ConditionalPropertyList<T extends boolean> = T extends true
   ? ReportInterface.PropertySummary[] // Full data including reservationListItems
   : Array<
        Omit<
           ReportInterface.PropertySummary,
           'roomTypes' // Omit the full roomTypes array
        > & {
           // Replace it with a roomTypes array that omits reservation details
           roomTypes: Array<
              Omit<
                 ReportInterface.RoomTypeWithAvailability,
                 'reservationListItems' | 'pagination' // Omit the specific fields
              >
           >;
        }
     >; // Base data excluding detailed reservation items

export function filterAndSortProperties<T extends boolean> (
   propertyMap: Map<string, ReportInterface.PropertySummary>, // Input always has full data
   roomTypeMap: Map<string, ReportInterface.RoomTypeWithAvailability>, // Input always has full data
   reservations: any[],
   filters: ReportInterface.ReportFilters,
   options: ReportInterface.ReportOptions & { fetchAllData?: T } // Ensure fetchAllData is part of options for typing
): {
   paginatedProperties: ConditionalPropertyList<T>; // Use the conditional type here
   total: number;
   totalPages: number;
} {
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
      properties = properties.filter(
         p =>
            p.property.name.toLowerCase().includes(searchLower) ||
            (p.property.address || '').toLowerCase().includes(searchLower) ||
            (p.property.city || '').toLowerCase().includes(searchLower) ||
            (p.property.province || '').toLowerCase().includes(searchLower)
      );
   }
   if (filters.propertySearch) {
      const searchLower = filters.propertySearch.toLowerCase();
      properties = properties.filter(
         p =>
            p.property.name.toLowerCase().includes(searchLower) ||
            (p.property.address || '').toLowerCase().includes(searchLower) ||
            (p.property.city || '').toLowerCase().includes(searchLower) ||
            (p.property.province || '').toLowerCase().includes(searchLower)
      );
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
         return {
            ...propSummary,
            roomTypes: filteredRoomTypes
         };
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

   let finalPaginatedProperties: any; // We'll use the conditional type for the actual return

   if (fetchAllData) {
      // If fetchAllData is true, return the full property objects with reservationListItems
      finalPaginatedProperties = paginatedPropertiesFull;
   } else {
      // If fetchAllData is false, omit reservationListItems (and related fields) from roomTypes
      finalPaginatedProperties = paginatedPropertiesFull.map(prop => ({
         ...prop, // Copy all top-level properties (property, period, summary)
         roomTypes: prop.roomTypes.map(rt => {
            // For each room type, omit reservationListItems, pagination, and totalAmount
            const { reservationListItems, pagination, ...rest } = rt;
            return rest; // Return the room type object without the omitted fields
         })
      }));
   }
   // --- End of conditional processing ---

   return {
      paginatedProperties: finalPaginatedProperties as ConditionalPropertyList<T>, // Type assertion
      total,
      totalPages
   };
}

function getSortComparator (sortBy: string = 'name', sortDir: 'asc' | 'desc' = 'asc') {
   return (a: ReportInterface.PropertySummary, b: ReportInterface.PropertySummary) => {
      let aVal: any = 0;
      let bVal: any = 0;
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
