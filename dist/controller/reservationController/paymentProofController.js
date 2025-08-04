"use strict";
// // controllers/paymentProofController.ts
// import { Request, Response } from 'express';
// import { uploadPaymentProof } from '../../service/reservationService/uploadPaymentService';
// import { handleError } from "../../helpers/errorHandler";
// export async function uploadPaymentProofController(req: Request, res: Response) {
//    try {
//       const validationResult = validateUploadRequest(req);
//       if (!validationResult.isValid) {
//          return res.status(400).json({
//             success: false,
//             message: validationResult.error
//          });
//       }
//       const { reservationId, file } = validationResult.data;
//       const userId = req.user?.userId;
//       const result = await uploadPaymentProof(
//          reservationId,
//          userId,
//          file.buffer,
//          file.originalname
//       );
//       return res.status(200).json({
//          success: true,
//          message: 'Payment proof uploaded successfully',
//          data: formatResponse(result)
//       });
//    } catch (error) {
//       return handleError(error, res);
//    }
// }
// interface ValidationResult {
//    isValid: boolean;
//    error?: string;
//    data?: {
//       reservationId: string;
//       file: Express.Multer.File;
//    };
// }
// function validateUploadRequest(req: Request): ValidationResult {
//    const reservationId = req.params.reservationId;
//    const file = req.file;
//    if (!reservationId) {
//       return {
//          isValid: false,
//          error: 'Reservation ID is required'
//       };
//    }
//    if (!file) {
//       return {
//          isValid: false,
//          error: 'Payment proof file is required'
//       };
//    }
//    if (!req.user?.userId) {
//       return {
//          isValid: false,
//          error: 'User authentication required'
//       };
//    }
//    return {
//       isValid: true,
//       data: {
//          reservationId,
//          file
//       }
//    };
// }
// function formatResponse(reservation: any) {
//    return {
//       reservation: {
//          id: reservation.id,
//          orderStatus: reservation.orderStatus,
//          startDate: reservation.startDate,
//          endDate: reservation.endDate,
//          roomType: {
//             name: reservation.RoomType?.name
//          },
//          property: {
//             name: reservation.Property?.name
//          },
//          paymentProof: reservation.PaymentProof ? {
//             id: reservation.PaymentProof.id,
//             picture: {
//                id: reservation.PaymentProof.picture?.id,
//                url: reservation.PaymentProof.picture?.url,
//                alt: reservation.PaymentProof.picture?.alt
//             }
//          } : null
//       }
//    };
// }
