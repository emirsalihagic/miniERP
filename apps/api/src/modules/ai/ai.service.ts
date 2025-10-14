import { Injectable, ServiceUnavailableException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiProviderService } from './ai-provider.service';
import { ToolsExecutor } from './tools/tools.executor';
import { TOOL_SCHEMAS } from './tools/tools.schemas';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { ExecuteActionDto } from './dto/execute-action.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private aiProvider: AiProviderService,
    private toolsExecutor: ToolsExecutor,
  ) {}

  async chat(dto: ChatRequestDto, user: any): Promise<ChatResponseDto> {
    if (!this.aiProvider.getAvailability()) {
      throw new ServiceUnavailableException('AI service is not configured');
    }

    // Generate or retrieve conversationId
    const conversationId = dto.conversationId || uuidv4();
    
    // Get conversation history from Redis (simplified - in production use Redis)
    const conversationHistory = await this.getConversationHistory(conversationId);
    
    // Add user message to history
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: dto.message,
        timestamp: new Date()
      }
    ];

    try {
      // Call AI provider
      const response = await this.aiProvider.chat(messages, TOOL_SCHEMAS, user);
      
      let toolData: any = null;
      let proposedAction: any = null;
      let assistantMessage = response.message?.content || '';

      // Handle tool calls
      if (response.message?.tool_calls && response.message.tool_calls.length > 0) {
        for (const toolCall of response.message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          
          const toolSchema = TOOL_SCHEMAS.find(t => t.name === toolName);
          
          if (toolSchema?.requiresConfirmation) {
            // Return proposed action for confirmation
            proposedAction = {
              action: toolName,
              args: toolArgs,
              summary: this.generateActionSummary(toolName, toolArgs)
            };
          } else {
            // Execute read-only tool
            try {
              const result = await this.executeTool(toolName, toolArgs, user);
              toolData = result;
              assistantMessage += `\n\n${this.formatToolResult(toolName, result)}`;
            } catch (error) {
              assistantMessage += `\n\nError executing ${toolName}: ${error.message}`;
            }
          }
        }
      }

      // Store conversation history
      const updatedMessages = [
        ...messages,
        {
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date(),
          toolData
        }
      ];
      
      await this.storeConversationHistory(conversationId, updatedMessages.slice(-5)); // Keep last 5 messages

      return {
        conversationId,
        messages: updatedMessages,
        toolData,
        proposedAction
      };

    } catch (error) {
      throw new ServiceUnavailableException(`AI service error: ${error.message}`);
    }
  }

  async execute(dto: ExecuteActionDto, user: any): Promise<any> {
    const { action, args, conversationId } = dto;

    // Validate action exists
    const toolSchema = TOOL_SCHEMAS.find(t => t.name === action);
    if (!toolSchema) {
      throw new NotFoundException(`Unknown action: ${action}`);
    }

    try {
      // Execute the tool
      const result = await this.executeTool(action, args, user);

      // Log to audit
      await this.prisma.auditLog.create({
        data: {
          entityType: 'AI_ACTION',
          entityId: conversationId,
          action: `AI_${action.toUpperCase()}`,
          userId: user.id,
          metadata: { action, args: JSON.stringify(args) }
        }
      });

      // Return a proper response with success message
      return {
        success: true,
        message: this.generateSuccessMessage(action, result),
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Error executing ${action}: ${error.message}`,
        data: null
      };
    }
  }

  private async executeTool(toolName: string, args: any, user: any): Promise<any> {
    switch (toolName) {
      case 'searchProducts':
        return this.toolsExecutor.executeSearchProducts(args, user);
      case 'searchClients':
        return this.toolsExecutor.executeSearchClients(args, user);
      case 'addToCart':
        return this.toolsExecutor.executeAddToCart(args, user);
      case 'createOrderDirect':
        return this.toolsExecutor.executeCreateOrderDirect(args, user);
      case 'getOrderStats':
        return this.toolsExecutor.executeGetOrderStats(args, user);
      case 'getUserPreferences':
        return this.toolsExecutor.executeGetUserPreferences(args, user);
      case 'updateUserPreferences':
        return this.toolsExecutor.executeUpdateUserPreferences(args, user);
      default:
        throw new NotFoundException(`Unknown tool: ${toolName}`);
    }
  }

  private generateActionSummary(action: string, args: any): string {
    switch (action) {
      case 'addToCart':
        return `Add ${args.items.length} items to cart for client ${args.clientId}`;
      case 'createOrderDirect':
        return `Create order with ${args.items.length} items for client ${args.clientId}`;
      case 'updateUserPreferences':
        const changes = Object.keys(args).join(', ');
        return `Update user preferences: ${changes}`;
      default:
        return `Execute ${action}`;
    }
  }

  private generateSuccessMessage(action: string, result: any): string {
    switch (action) {
      case 'addToCart':
        return `Successfully added ${result.items?.length || 0} items to cart.`;
      case 'createOrderDirect':
        return `Order created successfully! Order ID: ${result.id || 'N/A'}`;
      case 'updateUserPreferences':
        return `User preferences updated successfully.`;
      default:
        return `Action completed successfully.`;
    }
  }

  private formatToolResult(toolName: string, result: any): string {
    switch (toolName) {
      case 'searchProducts':
        return `Found ${result.count} products matching your search.`;
      case 'searchClients':
        return `Found ${result.count} clients matching your search.`;
      case 'getOrderStats':
        return `Order statistics: ${result.totals.totalOrders} orders totaling ${result.totals.totalAmount}`;
      case 'getUserPreferences':
        return `Current user preferences retrieved.`;
      default:
        return `Operation completed successfully.`;
    }
  }

  private async getConversationHistory(conversationId: string): Promise<any[]> {
    // In production, this would use Redis
    // For now, return empty array
    return [];
  }

  private async storeConversationHistory(conversationId: string, messages: any[]): Promise<void> {
    // In production, this would use Redis with 30min TTL
    // For now, do nothing
  }
}
