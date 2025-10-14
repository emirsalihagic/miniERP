import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserPreferencesService } from './user-preferences.service';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('User Preferences')
@ApiBearerAuth()
@Controller('user-preferences')
@UseGuards(JwtAuthGuard)
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  @Get()
  async findOne(@Request() req) {
    const userId = req.user.id;
    const preferences = await this.userPreferencesService.findByUserId(userId);
    
    if (!preferences) {
      // Return default preferences if none exist
      return {
        data: {
          id: '',
          userId,
          theme: 'LIGHT',
          dateFormat: 'DD_MM_YYYY',
          timeFormat: 'HOUR_24',
          currency: 'BAM',
          autoSaveForms: true,
          emailNotifications: false,
          language: 'EN',
          timezone: 'Europe/Sarajevo',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      };
    }
    
    return { data: preferences };
  }

  @Patch()
  async update(@Request() req, @Body() updateUserPreferencesDto: UpdateUserPreferencesDto) {
    const userId = req.user.id;
    const preferences = await this.userPreferencesService.update(userId, updateUserPreferencesDto);
    return { data: preferences };
  }
}