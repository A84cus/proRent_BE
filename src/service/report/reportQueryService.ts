// services/report/reportQueryService.ts
export const TransactionReportQuery = {
   id: true,
   startDate: true,
   endDate: true,
   orderStatus: true,
   createdAt: true,
   propertyId: true,
   Property: {
      select: {
         name: true
      }
   },
   roomTypeId: true,
   RoomType: {
      select: {
         name: true
      }
   },
   userId: true,
   User: {
      select: {
         email: true,
         profile: {
            select: {
               firstName: true,
               lastName: true
            }
         }
      }
   },
   payment: {
      select: {
         amount: true
      }
   }
};

export const TransactionUserReportQuery = {
   userId: true,
   payment: {
      select: {
         amount: true // This is Float, will convert to Decimal for aggregation
      }
   },
   User: {
      select: {
         email: true,
         profile: {
            select: {
               firstName: true,
               lastName: true
            }
         }
      }
   }
};
