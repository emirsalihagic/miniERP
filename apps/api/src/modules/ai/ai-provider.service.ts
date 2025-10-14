import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TOOL_SCHEMAS } from './tools/tools.schemas';
import { zodToJsonSchema } from 'zod-to-json-schema';

@Injectable()
export class AiProviderService {
  private openai: OpenAI;
  private isAvailable: boolean = false;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not set - AI features disabled');
      this.isAvailable = false;
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey
    });
    this.isAvailable = true;
  }

  async chat(messages: any[], tools: any[], user: any) {
    if (!this.isAvailable) {
      throw new ServiceUnavailableException('AI service is not configured');
    }

    const systemPrompt = `You are BlueLedger AI ★, the intelligent assistant for miniERP. 
    User role: ${user.role}. 
    ${user.role === 'CLIENT_USER' ? `User can only access Client ID: ${user.clientId}` : 'User is an employee with access to all clients.'}.
    For any mutating action (addToCart, createOrderDirect, updateUserPreferences), return proposed_action instead of executing.
    Always validate items exist and client has access.
    Be helpful, concise, and professional.`;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL') || 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      tools: tools.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: zodToJsonSchema(t.parameters)
        }
      })),
      tool_choice: 'auto'
    });

    return response.choices[0];
  }

  getAvailability(): boolean {
    return this.isAvailable;
  }
}
