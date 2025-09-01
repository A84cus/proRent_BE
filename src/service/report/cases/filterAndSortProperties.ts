import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';
import { aggregateSummaries } from '../utils/aggregateSummaries';

export function filterAndSortProperties (
   propertyMap: Map<string, ReportInterface.PropertySummary>,
   roomTypeMap: Map<string, ReportInterface.RoomTypeWithAvailability>,
   reservations: any[],
   filters: ReportInterface.ReportFilters, // Make sure propertyId is part of ReportFilters interface
   options: ReportInterface.ReportOptions
): {
   paginatedProperties: ReportInterface.PropertySummary[];
   total: number;
   totalPages: number;
} {
   // 1. Start with all properties from the map (which includes all owner's properties)
   let properties = Array.from(propertyMap.values());

   // 2. --- ADD THIS BLOCK: Apply propertyId filter ---
   if (filters.propertyId) {
      // Filter properties to only include the one specified by propertyId
      properties = properties.filter(p => p.property.id === filters.propertyId);
      // Note: If the propertyId is invalid, this will result in an empty list.
   }
   // --- END OF NEW BLOCK ---

   // 3. Apply other property-level filters (existing code)
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

   // 4. Apply room-type-specific filters (existing code - remains unchanged)
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

   // 5. Sort the properties list (existing code)
   properties.sort(getSortComparator(options.sortBy, options.sortDir));

   // 6. Paginate the properties list (existing code)
   const { page = 1, pageSize = 10 } = options;
   const total = properties.length;
   const totalPages = Math.ceil(total / pageSize);
   const paginatedProperties = properties.slice((page - 1) * pageSize, page * pageSize);

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
