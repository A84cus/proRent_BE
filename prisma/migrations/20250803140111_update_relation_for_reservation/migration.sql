-- AddForeignKey
ALTER TABLE "Prorent"."Reservation" ADD CONSTRAINT "Reservation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Prorent"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
