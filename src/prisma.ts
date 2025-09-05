import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient({ log: [ 'query', 'info', 'warn', 'error' ] });
export default prisma;
