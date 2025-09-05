import { Request, Response, NextFunction } from 'express';
import { getActualAvailabilityRecords } from '../../service/reservationService/availabilityService';
import { RESERVATION_ERROR_MESSAGES } from '../../constants';

export async function getAvailabilityScheduleHandler (req: Request, res: Response) {
   try {
      const { roomTypeId } = req.params;
      const { startDate, endDate } = req.query;

      if (!roomTypeId) {
         res.status(400).json({ message: RESERVATION_ERROR_MESSAGES.ROOMTYPE_ID_REQUIRED });
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const records = await getActualAvailabilityRecords(roomTypeId as string, start, end);

      const formatted = records.map(r => ({
         date: r.date.toISOString().split('T')[0],
         availableCount: r.availableCount
      }));

      res.json({ data: formatted });
      return;
   } catch (error: any) {
      res.status(500).json({ error: error.message || RESERVATION_ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
   }
}
