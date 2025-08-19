import { PrismaClient, User, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

class UserRepository {
  // Find user by email with optional include
  async findByEmail(
    email: string,
    include?: Prisma.UserInclude
  ): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include,
    });
  }

  // Find user by ID with optional include
  async findById(
    id: string,
    include?: Prisma.UserInclude
  ): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include,
    });
  }

  // Create new user
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  // Update user
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  // Find user by verification token
  async findByVerificationToken(hashedToken: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        verificationToken: hashedToken,
        verificationExpires: {
          gt: new Date(),
        },
      },
    });
  }

  // Find user by reset token
  async findByResetToken(hashedToken: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetExpires: {
          gt: new Date(),
        },
      },
    });
  }

  // Clear verification token
  async clearVerificationToken(id: string): Promise<User> {
    return this.update(id, {
      isVerified: true,
      verificationToken: null,
      verificationExpires: null,
    });
  }

  // Clear reset token
  async clearResetToken(id: string): Promise<User> {
    return this.update(id, {
      resetToken: null,
      resetExpires: null,
    });
  }

  // Set verification token
  async setVerificationToken(
    id: string,
    hashedToken: string,
    expires: Date
  ): Promise<User> {
    return this.update(id, {
      verificationToken: hashedToken,
      verificationExpires: expires,
    });
  }

  // Set reset token
  async setResetToken(
    id: string,
    hashedToken: string,
    expires: Date
  ): Promise<User> {
    return this.update(id, {
      resetToken: hashedToken,
      resetExpires: expires,
    });
  }

  // Update password
  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.update(id, {
      password: hashedPassword,
    });
  }
}

export default new UserRepository();
