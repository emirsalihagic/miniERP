export interface ChatResponseDto {
  conversationId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    toolData?: any;
  }>;
  toolData?: any;
  proposedAction?: {
    action: string;
    args: any;
    summary: string;
  };
}
