// src/controllers/uploadPaymentProofController.ts
import { Request, Response, NextFunction } from "express";
import { uploadPaymentProof } from "../../service/reservationService/uploadPaymentService"; // Adjust path
import { ZodError } from "zod";
import { NODE_ENV } from "../../config"; // Adjust path to your env config
import {
  RESERVATION_ERROR_MESSAGES,
  RESERVATION_SUCCESS_MESSAGES,
} from "../../constants/controllers/reservation";

export const uploadPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { reservationId } = req.params;

    if (!reservationId) {
      res
        .status(400)
        .json({
          error: RESERVATION_ERROR_MESSAGES.RESERVATION_ID_REQUIRED_URL,
        });
      return;
    }

    const uploadedFile = req.file;
    if (!uploadedFile) {
      res.status(400).json({
        error: RESERVATION_ERROR_MESSAGES.NO_FILE_UPLOADED,
      });
      return;
    }

    // --- 2. Call the Service Layer ---
    // The service handles detailed validation, upload, and database updates.
    const updatedReservation = await uploadPaymentProof(
      reservationId,
      userId,
      uploadedFile
    );

    // --- 3. Send Success Response ---
    res.status(200).json({
      message: RESERVATION_SUCCESS_MESSAGES.PAYMENT_PROOF_UPLOADED,
      reservation: updatedReservation, // Include updated details
    });
    return;
  } catch (error: any) {
    console.error("Error in uploadPaymentProofController:", error);

    // --- 4. Handle Errors ---

    if (isServiceAuthorizationOrStateError(error.message)) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (error.message?.startsWith("File validation failed:")) {
      // Error message formatted by the service from Zod issues
      res.status(400).json({ error: error.message });
      return;
    }

    if (error.message?.startsWith("Failed to upload payment proof")) {
      // Error during Cloudinary interaction
      res.status(500).json({ error: error.message });
      return;
    }

    // Handle unexpected errors
    res.status(500).json({
      error: RESERVATION_ERROR_MESSAGES.PAYMENT_PROOF_UPLOAD_ERROR,
    });
  }
};

function getUserIdFromRequest(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error("AUTH_REQUIRED");
  }
  return userId;
}

function isServiceAuthorizationOrStateError(message: string): boolean {
  return (
    message.includes("Reservation not found") ||
    message.includes("Unauthorized") ||
    message.includes("can only upload proof for your own") ||
    message.includes("Payment proof can only be uploaded for") ||
    message.includes("Payment proof upload is only allowed for") ||
    message.includes("Payment proof already uploaded")
  );
}
