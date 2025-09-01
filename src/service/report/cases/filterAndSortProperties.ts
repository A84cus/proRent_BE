import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';
import { aggregateSummaries } from '../utils/aggregateSummaries';

export function filterAndSortProperties (
   propertyMap: Map<string, ReportInterface.PropertySummary>,
   roomTypeMap: Map<string, ReportInterface.RoomTypeWithAvailability>, // Not directly used for linking anymore, but might be needed for other checks
   reservations: any[], // Might be used for complex sorting, but not for linking room types
   filters: ReportInterface.ReportFilters,
   options: ReportInterface.ReportOptions
): {
   paginatedProperties: ReportInterface.PropertySummary[];
   total: number;
   totalPages: number;
} {
   // 1. Start with all properties from the map (which includes all owner's properties)
   let properties = Array.from(propertyMap.values());

   // 2. Apply property-level filters
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

   // 3. Apply room-type-specific filters to the roomTypes list *within* each property
   // This modifies the roomTypes array of each PropertySummary in the 'properties' array
   // We do this *before* pagination so pagination is based on properties that potentially have matching room types
   if (filters.roomTypeId || filters.roomTypeSearch) {
      properties = properties.map(propSummary => {
         // Filter the roomTypes array of this specific property
         let filteredRoomTypes = propSummary.roomTypes; // Start with all room types for this property

         if (filters.roomTypeId) {
            // Filter by specific RoomType ID
            filteredRoomTypes = filteredRoomTypes.filter(rt => rt.roomType.id === filters.roomTypeId);
         }

         if (filters.roomTypeSearch) {
            const rtSearchLower = filters.roomTypeSearch.toLowerCase();
            // Filter by RoomType name
            filteredRoomTypes = filteredRoomTypes.filter(rt => rt.roomType.name.toLowerCase().includes(rtSearchLower));
         }

         // Return a new object (or modify the existing one) with the filtered roomTypes
         // It's safer to create a new object to avoid mutating the original map values if they are reused elsewhere
         return {
            ...propSummary, // Copy all other properties
            roomTypes: filteredRoomTypes // Use the filtered list
         };
      });

      // 4. Important: After filtering room types, remove properties that no longer have any matching room types
      // This ensures properties are only shown if they have room types matching the room-type filters
      properties = properties.filter(prop => prop.roomTypes.length > 0);
   }
   // If no room-type filters, properties retain their full list of room types (including those with 0 reservations)

   // 5. Sort the properties list
   properties.sort(getSortComparator(options.sortBy, options.sortDir));

   // 6. Paginate the properties list
   const { page = 1, pageSize = 10 } = options;
   const total = properties.length;
   const totalPages = Math.ceil(total / pageSize);
   const paginatedProperties = properties.slice((page - 1) * pageSize, page * pageSize);

   // 7. The paginatedProperties already contain the correct roomTypes arrays
   // No need to re-assign prop.roomTypes here based on reservations.
   // The assignment `prop.roomTypes = prop.roomTypes` or similar is redundant.
   // The filtering and assignment happened in steps 3 & 4 above.

   return { paginatedProperties, total, totalPages };
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
            // Calculate pending as the sum of PENDING_PAYMENT and PENDING_CONFIRMATION
            aVal = (a.summary.counts.PENDING_PAYMENT || 0) + (a.summary.counts.PENDING_CONFIRMATION || 0);
            bVal = (b.summary.counts.PENDING_PAYMENT || 0) + (b.summary.counts.PENDING_CONFIRMATION || 0);
            break;
         // Add cases for other potential sorts like city, province, address if needed
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
         // Add default case for name or other string sorts
         default:
            // Default to sorting by property name
            return sortDir === 'asc'
               ? a.property.name.localeCompare(b.property.name)
               : b.property.name.localeCompare(a.property.name);
      }
      // For numeric sorts (revenue, confirmed, pending)
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
   };
}
