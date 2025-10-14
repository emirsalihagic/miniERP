import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserPreferencesDto } from './dto/create-user-preferences.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UserPreferences } from '@prisma/client';

@Injectable()
export class UserPreferencesService {
  constructor(private prisma: PrismaService) {}

  async create(createUserPreferencesDto: CreateUserPreferencesDto): Promise<UserPreferences> {
    return this.prisma.userPreferences.create({
      data: createUserPreferencesDto,
    });
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    return this.prisma.userPreferences.findUnique({
      where: { userId },
    });
  }

  async update(userId: string, updateUserPreferencesDto: UpdateUserPreferencesDto): Promise<UserPreferences> {
    return this.prisma.userPreferences.upsert({
      where: { userId },
      update: updateUserPreferencesDto,
      create: {
        userId,
        ...updateUserPreferencesDto,
      },
    });
  }

  async remove(userId: string): Promise<UserPreferences> {
    return this.prisma.userPreferences.delete({
      where: { userId },
    });
  }
}
