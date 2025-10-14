import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ExecuteActionDto } from './dto/execute-action.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  async chat(@Body() dto: ChatRequestDto, @Request() req) {
    return this.aiService.chat(dto, req.user);
  }

  @Post('execute')
  async execute(@Body() dto: ExecuteActionDto, @Request() req) {
    return this.aiService.execute(dto, req.user);
  }
}
