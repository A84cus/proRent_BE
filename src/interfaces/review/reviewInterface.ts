// types/reviewTypes.ts

export interface CreateReviewInput {
   userId: string;
   reservationId: string;
   content: string;
   rating: number;
}

export interface ReplyToReviewInput {
   OwnerId: string;
   reviewId: string;
   content: string;
   rating?: number;
}

export enum sortBy {
   rating = 'rating',
   createdAt = 'createdAt',
   updatedAt = 'updatedAt'
}

export enum sortOrder {
   asc = 'asc',
   desc = 'desc'
}

export interface GetReviewsFilter {
   propertyId: string;
   page?: number;
   limit?: number;
   sortBy?: sortBy;
   sortOrder?: sortOrder;
   searchContent?: string;
   includeInvisible?: boolean;
}

export interface ReviewOutput {
   id: string;
   content: string;
   rating: number;
   visibility: boolean;
   createdAt: Date;
   updatedAt: Date;
   reviewer: { id: string } | null;
   OwnerReply: { id: string; content: string; createdAt: Date } | null;
   reservation: { id: string; startDate: Date; endDate: Date; Property: { id: string; name: string } | null } | null;
}

// Type for the result of getReviews
export interface GetReviewsResult {
   reviews: ReviewOutput[];
   total: number;
   page: number;
   limit: number;
   totalPages: number;
}

export interface GetReviewsFilterForOwner extends GetReviewsFilter {
   OwnerId: string;
}
