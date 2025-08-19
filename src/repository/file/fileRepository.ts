import { PrismaClient, Picture, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

class FileRepository {
  // Create file record
  async create(data: Prisma.PictureCreateInput): Promise<Picture> {
    return prisma.picture.create({ data });
  }

  // Find file by ID
  async findById(id: string): Promise<Picture | null> {
    return prisma.picture.findUnique({
      where: { id },
    });
  }

  // Delete file record
  async deleteById(id: string): Promise<Picture> {
    return prisma.picture.delete({
      where: { id },
    });
  }

  // List files with pagination
  async findMany(options: {
    skip: number;
    take: number;
    where?: Prisma.PictureWhereInput;
    orderBy?: Prisma.PictureOrderByWithRelationInput;
  }): Promise<Picture[]> {
    return prisma.picture.findMany(options);
  }

  // Count files
  async count(where?: Prisma.PictureWhereInput): Promise<number> {
    return prisma.picture.count({ where });
  }

  // Find files by type
  async findByType(type: string, limit?: number): Promise<Picture[]> {
    return prisma.picture.findMany({
      where: { type },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  // Update file record
  async update(id: string, data: Prisma.PictureUpdateInput): Promise<Picture> {
    return prisma.picture.update({
      where: { id },
      data,
    });
  }
}

export default new FileRepository();
