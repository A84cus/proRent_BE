/**
 * Repository Interface definitions
 * Contains all types related to repository operations
 */

import { Prisma } from "@prisma/client";

export interface PaginationOptions {
  skip: number;
  take: number;
  where?: any;
  orderBy?: any;
}

export interface FindManyResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

export interface CreateOptions<T> {
  data: T;
  include?: any;
}

export interface UpdateOptions<T> {
  where: any;
  data: T;
  include?: any;
}

export interface DeleteOptions {
  where: any;
}

export interface QueryOptions {
  include?: any;
  select?: any;
  orderBy?: any;
  take?: number;
  skip?: number;
}
