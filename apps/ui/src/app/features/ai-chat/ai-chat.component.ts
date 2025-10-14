import { Component, OnInit, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { AiChatService, ChatResponse, ExecuteRequest } from './ai-chat.service';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolData?: any;
}

interface ProposedAction {
  action: string;
  args: any;
  summary: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NzButtonModule,
    NzInputModule,
    NzCardModule,
    NzIconModule,
    NzModalModule,
    NzSpinModule,
    NzEmptyModule,
    AgGridAngular
  ],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.less']
})
export class AiChatComponent implements OnInit {
  messages = signal<Message[]>([]);
  userInput = signal('');
  conversationId = signal<string | null>(null);
  proposedAction = signal<ProposedAction | null>(null);
  loading = signal(false);
  isModalVisible = signal(false);

  // AG-Grid properties
  columnDefs: ColDef[] = [];
  rowData: any[] = [];

  constructor(
    private aiChatService: AiChatService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    // Add welcome message
    this.messages.set([{
      role: 'assistant',
      content: 'Hello! I\'m BlueLedger AI ★, your intelligent assistant for miniERP. I can help you search products, manage orders, view statistics, and more. How can I assist you today?',
      timestamp: new Date()
    }]);
  }

  sendMessage() {
    const message = this.userInput().trim();
    if (!message || this.loading()) return;

    this.loading.set(true);
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    this.messages.update(messages => [...messages, userMessage]);
    this.userInput.set('');

    // Call AI service
    this.aiChatService.chat(message, this.conversationId() || undefined)
      .subscribe({
        next: (response: ChatResponse) => {
          this.conversationId.set(response.conversationId);
          
          // Add assistant response
          const assistantMessage: Message = {
            role: 'assistant',
            content: response.messages[response.messages.length - 1].content,
            timestamp: new Date(),
            toolData: response.toolData
          };
          
          this.messages.update(messages => [...messages, assistantMessage]);
          
          // Handle proposed action
          if (response.proposedAction) {
            this.proposedAction.set(response.proposedAction);
            this.showConfirmationModal();
          }
          
          this.loading.set(false);
        },
        error: (error) => {
          console.error('AI Chat error:', error);
          this.message.error('Failed to send message. Please try again.');
          this.loading.set(false);
        }
      });
  }

  confirmAction() {
    const action = this.proposedAction();
    if (!action || !this.conversationId()) return;

    this.loading.set(true);
    
    const executeRequest: ExecuteRequest = {
      action: action.action,
      args: action.args,
      conversationId: this.conversationId()!
    };

    this.aiChatService.execute(executeRequest.action, executeRequest.args, executeRequest.conversationId)
      .subscribe({
        next: (result) => {
          // Add execution result message using the backend response
          const resultMessage: Message = {
            role: 'assistant',
            content: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
            timestamp: new Date(),
            toolData: result.data
          };
          
          this.messages.update(messages => [...messages, resultMessage]);
          this.proposedAction.set(null);
          this.isModalVisible.set(false);
          this.message.success('Action completed successfully!');
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Execute action error:', error);
          this.message.error('Failed to execute action. Please try again.');
          this.loading.set(false);
        }
      });
  }

  cancelAction() {
    this.proposedAction.set(null);
    this.isModalVisible.set(false);
  }

  private showConfirmationModal() {
    this.isModalVisible.set(true);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'addToCart':
        return 'shopping-cart';
      case 'createOrderDirect':
        return 'file-text';
      case 'updateUserPreferences':
        return 'setting';
      default:
        return 'tool';
    }
  }

  getActionTitle(action: string): string {
    switch (action) {
      case 'addToCart':
        return 'Add to Cart';
      case 'createOrderDirect':
        return 'Create Order';
      case 'updateUserPreferences':
        return 'Update Preferences';
      default:
        return 'Execute Action';
    }
  }

  trackByMessage(index: number, message: Message): string {
    return `${message.role}-${message.timestamp.getTime()}-${index}`;
  }

  formatMessageContent(content: string): string {
    // Simple formatting - in production you might want more sophisticated markdown parsing
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  getProductColumns(): ColDef[] {
    return [
      { field: 'name', headerName: 'Product Name', flex: 2 },
      { field: 'sku', headerName: 'SKU', flex: 1 },
      { field: 'description', headerName: 'Description', flex: 2 },
      { 
        field: 'supplier', 
        headerName: 'Supplier', 
        flex: 1,
        valueGetter: (params) => params.data.supplier?.name || 'N/A'
      },
      { 
        field: 'unit', 
        headerName: 'Unit', 
        flex: 1,
        valueGetter: (params) => params.data.unit?.name || 'N/A'
      }
    ];
  }

  getClientColumns(): ColDef[] {
    return [
      { field: 'name', headerName: 'Client Name', flex: 2 },
      { field: 'email', headerName: 'Email', flex: 2 },
      { field: 'type', headerName: 'Type', flex: 1 },
      { field: 'status', headerName: 'Status', flex: 1 },
      { field: 'contactPerson', headerName: 'Contact Person', flex: 1 }
    ];
  }

  getOrderStatsColumns(): ColDef[] {
    return [
      { field: 'date', headerName: 'Date', flex: 1 },
      { field: 'count', headerName: 'Orders', flex: 1 },
      { 
        field: 'totalAmount', 
        headerName: 'Total Amount', 
        flex: 1,
        valueFormatter: (params) => this.formatCurrency(params.value)
      }
    ];
  }

  getPreferencesList(preferences: any): Array<{label: string, value: string}> {
    const list: Array<{label: string, value: string}> = [];
    
    if (preferences.theme) list.push({ label: 'Theme', value: preferences.theme });
    if (preferences.language) list.push({ label: 'Language', value: preferences.language });
    if (preferences.currency) list.push({ label: 'Currency', value: preferences.currency });
    if (preferences.dateFormat) list.push({ label: 'Date Format', value: preferences.dateFormat });
    if (preferences.timeFormat) list.push({ label: 'Time Format', value: preferences.timeFormat });
    if (preferences.timezone) list.push({ label: 'Timezone', value: preferences.timezone });
    if (preferences.emailNotifications !== undefined) {
      list.push({ label: 'Email Notifications', value: preferences.emailNotifications ? 'Enabled' : 'Disabled' });
    }
    if (preferences.autoSaveForms !== undefined) {
      list.push({ label: 'Auto Save Forms', value: preferences.autoSaveForms ? 'Enabled' : 'Disabled' });
    }
    
    return list;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('bs-BA', {
      style: 'currency',
      currency: 'BAM'
    }).format(value);
  }

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100
  };
}
