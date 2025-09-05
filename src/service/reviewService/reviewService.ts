// services/reviewService.ts
import prisma from '../../prisma'; // Adjust path
import { Status } from '@prisma/client';
import { CreateReviewInput, ReplyToReviewInput } from '../../interfaces'; // Adjust path
import {
   validateReviewRating,
   validateReviewComment,
   validateReviewOwnership,
   reviewCreateSchema
} from '../../validations/review/reviewValidation';
import { ReplyInclude, ReviewInclude, SelectEligibleReservations } from './reviewQueryHelper';

export async function getEligibleReservationsForReview (userId: string, propertyId: string) {
   const today = new Date();
   try {
      const eligibleReservations = await prisma.reservation.findMany({
         where: {
            userId,
            propertyId,
            orderStatus: Status.CONFIRMED,
            endDate: {
               lt: today
            },
            review: null,
            payment: {
               paymentStatus: Status.CONFIRMED
            }
         },
         select: SelectEligibleReservations,
         orderBy: {
            endDate: 'desc'
         }
      });
      return eligibleReservations.map(res => ({
         id: res.id,
         propertyId: res.Property?.id,
         propertyName: res.Property?.name || 'Unknown Property',
         propertyImageUrl: res.Property?.mainPicture?.url || null,
         startDate: res.startDate,
         endDate: res.endDate
      }));
   } catch (error) {
      console.error('Error in getEligibleReservationsForReview service:', error);
      throw new Error('Failed to fetch eligible reservations. Please try again later.');
   }
}

// --- Helper: Validate Review Creation Conditions ---
async function validateReviewCreation (data: CreateReviewInput): Promise<void> {
   const { userId, reservationId, rating, content } = data;
   const ratingValidation = validateReviewRating(rating);
   if (!ratingValidation.isValid) {
      throw new Error(ratingValidation.error!);
   }

   const commentValidation = validateReviewComment(content);
   if (!commentValidation.isValid) {
      throw new Error(commentValidation.error!);
   }

   const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
         User: { select: { id: true } },
         Property: { select: { id: true, OwnerId: true } },
         review: { select: { id: true } }
      }
   });

   if (!reservation) {
      throw new Error('Reservation not found.');
   }

   // Validate ownership using centralized validation
   const ownershipValidation = validateReviewOwnership(reservation.User?.id!, userId);
   if (!ownershipValidation.isValid) {
      throw new Error(ownershipValidation.error!);
   }

   if (reservation.review) {
      throw new Error('A review already exists for this reservation.');
   }
   if (reservation.orderStatus !== Status.CONFIRMED) {
      throw new Error('Only confirmed reservations can be reviewed.');
   }
   const today = new Date();
   const reservationEndDate = new Date(reservation.endDate);
   if (today <= reservationEndDate) {
      throw new Error('Reviews can only be submitted after the reservation end date.');
   }
}

// --- Service: Create a Review ---
export async function createReview (input: CreateReviewInput) {
   await validateReviewCreation(input);
   const { userId, reservationId, content, rating } = input;

   // Fetch reservation to get property owner (reviewee)
   const reservation = await prisma.reservation.findUniqueOrThrow({
      where: { id: reservationId },
      select: {
         Property: {
            select: {
               OwnerId: true
            }
         },
         userId: true
      }
   });

   // Double-check: ensure the userId matches the reservation's guest
   if (reservation.userId !== userId) {
      throw new Error('You can only review your own reservations.');
   }

   const newReview = await prisma.review.create({
      data: {
         content,
         rating,
         reviewer: { connect: { id: userId } }, // Guest (reviewer)
         reviewee: { connect: { id: reservation.Property.OwnerId } }, // Host (reviewee)
         reservation: { connect: { id: reservationId } }
      },
      include: ReviewInclude
   });

   return newReview;
}

// --- Helper: Validate Owner Reply Conditions ---
async function validateOwnerReply (data: ReplyToReviewInput): Promise<void> {
   const { OwnerId, reviewId } = data;

   const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
         reservation: { select: { Property: { select: { OwnerId: true } } } }
      }
   });

   if (!review) {
      throw new Error('Review not found.');
   }
   if (review.reservation?.Property?.OwnerId !== OwnerId) {
      throw new Error('Unauthorized: You can only reply to reviews for your own properties.');
   }
}

// --- Service: Owner Replies to a Review ---
export async function replyToReview (input: ReplyToReviewInput) {
   await validateOwnerReply(input);
   const { reviewId, content } = input;

   // Use upsert to create or update the reply
   const ownerReply = await prisma.ownerReply.upsert({
      where: { reviewId },
      update: { content },
      create: {
         content,
         review: { connect: { id: reviewId } }
      },
      include: ReplyInclude
   });

   return ownerReply;
}
