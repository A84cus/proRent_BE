import { PrismaClient } from "@prisma/client";
import logger from "../../utils/system/logger";

const prisma = new PrismaClient();

class UserProfileService {
  // Get user profile with all related data
  async getUserProfile(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            birthDate: true,
            address: true,
            avatar: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
            location: {
              select: {
                id: true,
                name: true,
                city: {
                  select: {
                    name: true,
                    province: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Format profile data for response
  formatProfileData(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profile: {
        firstName: user.profile?.firstName || null,
        lastName: user.profile?.lastName || null,
        phone: user.profile?.phone || null,
        avatar: user.profile?.avatar
          ? {
              id: user.profile.avatar.id,
              url: user.profile.avatar.url,
              alt: user.profile.avatar.alt,
            }
          : null,
        birthDate: user.profile?.birthDate || null,
        address: user.profile?.address || null,
        location: user.profile?.location
          ? {
              id: user.profile.location.id,
              name: user.profile.location.name,
              city: {
                name: user.profile.location.city.name,
                province: {
                  name: user.profile.location.city.province.name,
                },
              },
            }
          : null,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Update user profile
  async updateUserProfile(userId: string, profileData: any) {
    const { firstName, lastName, phone, birthDate, address } = profileData;

    // Parse birthDate if provided
    let parsedBirthDate;
    if (birthDate) {
      parsedBirthDate = new Date(birthDate);
      if (isNaN(parsedBirthDate.getTime())) {
        throw new Error("Invalid birth date format");
      }
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(parsedBirthDate && { birthDate: parsedBirthDate }),
        ...(address !== undefined && { address }),
      },
      create: {
        userId,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        birthDate: parsedBirthDate || null,
        address: address || null,
      },
      include: {
        avatar: {
          select: {
            id: true,
            url: true,
            alt: true,
          },
        },
      },
    });

    logger.info(`Profile updated for user ID: ${userId}`);

    return {
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      name:
        `${updatedProfile.firstName || ""} ${
          updatedProfile.lastName || ""
        }`.trim() || null,
      phone: updatedProfile.phone,
      birthDate: updatedProfile.birthDate,
      address: updatedProfile.address,
      avatar: updatedProfile.avatar,
    };
  }

  // Check if user exists
  async checkUserExists(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }
}

export default new UserProfileService();
