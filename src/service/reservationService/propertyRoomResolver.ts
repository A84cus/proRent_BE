// services/propertyRoomResolver.ts
import prisma from '../../prisma';
import { PropertyRentalType } from '@prisma/client'; // Make sure this enum is in your schema

export async function resolveTargetRoomTypeId (
   propertyId: string,
   providedRoomTypeId: string | undefined
): Promise<string> {
   // 1. Fetch Property and its rooms (specifically the one marked as whole unit if needed)
   const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
         roomTypes: {
            where: providedRoomTypeId ? { id: providedRoomTypeId } : { isWholeUnit: true }
         }
      }
   });

   if (!property) {
      throw new Error('Property not found');
   }

   let targetRoomTypeId: string;

   if (property.rentalType === PropertyRentalType.WHOLE_PROPERTY) {
      // --- Logic for WHOLE_PROPERTY ---
      const wholeUnitRoom = property.roomTypes.find(r => r.isWholeUnit);
      if (!wholeUnitRoom) {
         throw new Error('Configuration Error: Whole property unit room not found for this property.');
      }
      targetRoomTypeId = wholeUnitRoom.id;

      if (providedRoomTypeId && providedRoomTypeId !== targetRoomTypeId) {
         console.warn('Ignoring provided roomId for WHOLE_PROPERTY type booking. Using designated whole unit.');
      }
   } else if (property.rentalType === PropertyRentalType.ROOM_BY_ROOM) {
      // --- Logic for ROOM_BY_ROOM ---
      if (!providedRoomTypeId) {
         throw new Error('Room ID is required for room-by-room rental type.');
      }
      const selectedRoom = property.roomTypes.find(r => r.id === providedRoomTypeId);
      if (!selectedRoom) {
         throw new Error('Selected room not found for this property or does not belong to it.');
      }
      targetRoomTypeId = providedRoomTypeId;
   } else {
      throw new Error(`Unsupported property rental type: ${property.rentalType}`);
   }

   return targetRoomTypeId;
}

export async function validatePropertyRentalTypeRequirements (
   propertyId: string,
   providedRoomTypeId: string | undefined
): Promise<void> {
   const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { rentalType: true } // Only fetch the type needed for validation
   });

   if (!property) {
      throw new Error('Property not found');
   }

   if (property.rentalType === PropertyRentalType.WHOLE_PROPERTY) {
   } else if (property.rentalType === PropertyRentalType.ROOM_BY_ROOM) {
      if (!providedRoomTypeId) {
         throw new Error('Room ID is required for room-by-room rental type.');
      }
      // You could add more specific validations here if needed for ROOM_BY_ROOM
   } else {
      throw new Error(`Unsupported property rental type: ${property.rentalType}`);
   }
}
