import { IsString, IsObject } from 'class-validator';

export class ExecuteActionDto {
  @IsString()
  action: string;

  @IsObject()
  args: any;

  @IsString()
  conversationId: string;
}
