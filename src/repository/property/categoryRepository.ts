import { PrismaClient, Category, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

class CategoryRepository {
  // Get all categories
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // Find category by ID
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  // Find category by name
  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  // Create new category
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  // Update category
  async update(
    id: string,
    data: Prisma.CategoryUpdateInput
  ): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  // Delete category
  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }

  // Check if category is being used by any property
  async isUsedByProperty(id: string): Promise<boolean> {
    const count = await prisma.property.count({
      where: { categoryId: id },
    });
    return count > 0;
  }
}

export default new CategoryRepository();
