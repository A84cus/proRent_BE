// services/reviewQueries.ts
import { GetReviewsFilter, GetReviewsResult } from '../../interfaces/reviewInterface';
import prisma from '../../prisma';
import { Status } from '@prisma/client';

// --- Query: Fetch Reservation for Review Validation ---
export async function getReviewsPublic (filter: GetReviewsFilter): Promise<GetReviewsResult> {
   const { propertyId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', searchContent } = filter;

   const skip = (page - 1) * limit;
   const take = limit;

   // Build where conditions
   const whereConditions: any = {
      reservation: { propertyId },
      visibility: true // Rule 5: Only visible reviews for public search
   };

   if (searchContent) {
      whereConditions.content = { contains: searchContent, mode: 'insensitive' };
   }

   const [ reviews, total ] = await Promise.all([
      prisma.review.findMany({
         where: whereConditions,
         skip,
         take,
         orderBy: { [sortBy]: sortOrder },
         include: {
            reviewer: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
            OwnerReply: { select: { id: true, content: true, createdAt: true } },
            reservation: {
               select: { id: true, startDate: true, endDate: true, Property: { select: { id: true, name: true } } }
            }
         }
      }),
      prisma.review.count({ where: whereConditions })
   ]);

   const totalPages = Math.ceil(total / limit);

   return { reviews, total, page, limit, totalPages };
}

// --- Service: Get Reviews for Owner Management (All visibility) ---
export async function getReviewsForOwner (filter: GetReviewsFilter): Promise<GetReviewsResult> {
   const {
      propertyId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      searchContent,
      includeInvisible = true
   } = filter;

   const skip = (page - 1) * limit;
   const take = limit;

   const whereConditions: any = {
      reservation: { propertyId }
   };

   if (searchContent) {
      whereConditions.content = { contains: searchContent, mode: 'insensitive' };
   }

   const [ reviews, total ] = await Promise.all([
      prisma.review.findMany({
         where: whereConditions,
         skip,
         take,
         orderBy: { [sortBy]: sortOrder },
         include: {
            reviewer: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
            OwnerReply: { select: { id: true, content: true, createdAt: true, visibility: true } },
            reservation: {
               select: {
                  id: true,
                  startDate: true,
                  endDate: true,
                  orderStatus: true,
                  Property: { select: { id: true, name: true } }
               }
            }
         }
      }),
      prisma.review.count({ where: whereConditions })
   ]);

   const totalPages = Math.ceil(total / limit);

   return { reviews, total, page, limit, totalPages };
}

// --- Service: Update Review Visibility (Owner Action - Optional) ---
// If you need an explicit function for owner to change review visibility
export async function updateReviewVisibility (ownerId: string, reviewId: string, visibility: boolean) {
   // Validate owner owns the property related to the review
   const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { reservation: { select: { Property: { select: { OwnerId: true } } } } }
   });
   if (!review || review.reservation?.Property?.OwnerId !== ownerId) {
      throw new Error('Unauthorized or review not found.');
   }

   const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { visibility },
      include: {
         reviewer: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
         OwnerReply: true
      }
   });
   return updatedReview;
}
