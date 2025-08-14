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

export interface GetReviewsFilter {
   propertyId: string;
   page?: number;
   limit?: number;
   sortBy?: 'rating' | 'createdAt' | 'updatedAt';
   sortOrder?: 'asc' | 'desc';
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
