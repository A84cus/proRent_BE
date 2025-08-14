export function buildRoomTypeInclude (propertyOwnerId?: string) {
   return {
      select: {
         name: true,
         basePrice: true,
         property: {
            select: {
               id: true,
               name: true,
               location: true,
               ...(propertyOwnerId && { OwnerId: true })
            }
         }
      }
   };
}

export function buildPaymentsInclude () {
   return {
      select: {
         id: true,
         invoiceNumber: true,
         amount: true,
         method: true,
         paymentStatus: true,
         createdAt: true
      }
   };
}

export function buildUserInclude () {
   return {
      select: {
         id: true,
         profile: {
            select: {
               firstName: true,
               lastName: true,
               phone: true
            }
         },
         email: true
      }
   };
}

export function buildPaymentProofInclude () {
   return {
      select: {
         id: true,
         picture: {
            select: {
               id: true,
               url: true,
               alt: true,
               type: true,
               sizeKB: true,
               uploadedAt: true,
               createdAt: true,
               updatedAt: true
            }
         }
      }
   };
}
