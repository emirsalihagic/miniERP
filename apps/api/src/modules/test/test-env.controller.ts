import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('test')
export class TestEnvController {
  constructor(private configService: ConfigService) {}

  @Get('env')
  testEnv() {
    return {
      openaiKey: this.configService.get('OPENAI_API_KEY') ? 'LOADED' : 'NOT LOADED',
      openaiModel: this.configService.get('OPENAI_MODEL') || 'NOT SET',
      nodeEnv: this.configService.get('NODE_ENV') || 'NOT SET',
      port: this.configService.get('PORT') || 'NOT SET'
    };
  }
}
