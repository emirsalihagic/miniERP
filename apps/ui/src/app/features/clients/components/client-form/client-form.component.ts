import { Component, OnInit, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { ClientsService } from '../../services/clients.service';
import { 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest,
  ClientType, 
  ClientStatus, 
  PaymentTerms, 
  Currency 
} from '../../../../shared/interfaces/client.interface';
import { CanComponentDeactivate } from '../../../../core/guards/pending-changes.guard';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzSpaceModule,
    NzIconModule,
    NzMessageModule,
    NzSpinModule,
    NzDatePickerModule,
    NzInputNumberModule,
    NzTagModule
  ],
  template: `
    <div class="client-form-container">
      <nz-card [nzTitle]="isEditMode() ? 'Edit Client' : 'Create New Client'" class="form-card">
        <nz-spin [nzSpinning]="loading()">
          <form nz-form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
            <!-- Basic Information -->
            <nz-card nzTitle="Basic Information" nzSize="small" class="section-card">
              <nz-row [nzGutter]="16">
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6" nzRequired>Name</nz-form-label>
                    <nz-form-control [nzSpan]="18" nzErrorTip="Please enter client name">
                      <input nz-input formControlName="name" placeholder="Client name" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6">Type</nz-form-label>
                    <nz-form-control [nzSpan]="18">
                      <nz-select formControlName="type" nzPlaceHolder="Select type">
                        <nz-option nzValue="COMPANY" nzLabel="Company"></nz-option>
                        <nz-option nzValue="INDIVIDUAL" nzLabel="Individual"></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>

              <nz-row [nzGutter]="16">
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6">Contact Person</nz-form-label>
                    <nz-form-control [nzSpan]="18">
                      <input nz-input formControlName="contactPerson" placeholder="Contact person name" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6" nzRequired>Email</nz-form-label>
                    <nz-form-control [nzSpan]="18" nzErrorTip="Please enter valid email">
                      <input nz-input formControlName="email" type="email" placeholder="client@example.com" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>

              <nz-row [nzGutter]="16">
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6">Phone</nz-form-label>
                    <nz-form-control [nzSpan]="18">
                      <input nz-input formControlName="phone" placeholder="+1234567890" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6">Website</nz-form-label>
                    <nz-form-control [nzSpan]="18">
                      <input nz-input formControlName="website" placeholder="https://example.com" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>

              <nz-row [nzGutter]="16">
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6">Tax Number</nz-form-label>
                    <nz-form-control [nzSpan]="18">
                      <input nz-input formControlName="taxNumber" placeholder="Tax identification number" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6">Client Code</nz-form-label>
                    <nz-form-control [nzSpan]="18">
                      <input nz-input formControlName="clientCode" placeholder="Unique client code" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>
            </nz-card>

            <!-- Billing Information -->
            <nz-card nzTitle="Billing Information" nzSize="small" class="section-card">
              <nz-row [nzGutter]="16">
                <nz-col nzSpan="24">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="3">Billing Street</nz-form-label>
                    <nz-form-control [nzSpan]="21">
                      <input nz-input formControlName="billingStreet" placeholder="Street address" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>

              <nz-row [nzGutter]="16">
                <nz-col nzSpan="8">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="8">City</nz-form-label>
                    <nz-form-control [nzSpan]="16">
                      <input nz-input formControlName="billingCity" placeholder="City" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
                <nz-col nzSpan="8">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="8">Zip Code</nz-form-label>
                    <nz-form-control [nzSpan]="16">
                      <input nz-input formControlName="billingZip" placeholder="Zip code" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
                <nz-col nzSpan="8">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="8">Country</nz-form-label>
                    <nz-form-control [nzSpan]="16">
                      <input nz-input formControlName="billingCountry" placeholder="Country" />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>
            </nz-card>

            <!-- Business Information -->
            <nz-card nzTitle="Business Information" nzSize="small" class="section-card">
              <nz-row [nzGutter]="16">
                <nz-col nzSpan="8">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="8">Status</nz-form-label>
                    <nz-form-control [nzSpan]="16">
                      <nz-select formControlName="status" nzPlaceHolder="Select status">
                        <nz-option nzValue="ACTIVE" nzLabel="Active"></nz-option>
                        <nz-option nzValue="INACTIVE" nzLabel="Inactive"></nz-option>
                        <nz-option nzValue="PROSPECT" nzLabel="Prospect"></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
                <nz-col nzSpan="8">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="8">Payment Terms</nz-form-label>
                    <nz-form-control [nzSpan]="16">
                      <nz-select formControlName="paymentTerms" nzPlaceHolder="Select terms">
                        <nz-option nzValue="ON_RECEIPT" nzLabel="On Receipt"></nz-option>
                        <nz-option nzValue="D7" nzLabel="7 Days"></nz-option>
                        <nz-option nzValue="D15" nzLabel="15 Days"></nz-option>
                        <nz-option nzValue="D30" nzLabel="30 Days"></nz-option>
                        <nz-option nzValue="D45" nzLabel="45 Days"></nz-option>
                        <nz-option nzValue="D60" nzLabel="60 Days"></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
                <nz-col nzSpan="8">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="8">Currency</nz-form-label>
                    <nz-form-control [nzSpan]="16">
                      <nz-select formControlName="preferredCurrency" nzPlaceHolder="Select currency" (ngModelChange)="onCurrencyChange()">
                        <nz-option nzValue="BAM" nzLabel="BAM"></nz-option>
                        <nz-option nzValue="EUR" nzLabel="EUR"></nz-option>
                        <nz-option nzValue="USD" nzLabel="USD"></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>

              <nz-row [nzGutter]="16">
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6">Credit Limit</nz-form-label>
                    <nz-form-control [nzSpan]="18">
                      <nz-input-number 
                        formControlName="creditLimit" 
                        [nzMin]="0" 
                        [nzStep]="100"
                        [nzFormatter]="currencyFormatter"
                        [nzParser]="currencyParser"
                        style="width: 100%"
                      ></nz-input-number>
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6">Lead Source</nz-form-label>
                    <nz-form-control [nzSpan]="18">
                      <input nz-input formControlName="leadSource" placeholder="Website, Referral, etc." />
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>
            </nz-card>

            <!-- CRM Information -->
            <nz-card nzTitle="CRM Information" nzSize="small" class="section-card">
              <nz-row [nzGutter]="16">
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6">Last Contacted</nz-form-label>
                    <nz-form-control [nzSpan]="18">
                      <nz-date-picker 
                        formControlName="lastContactedAt" 
                        nzFormat="MMM dd, yyyy"
                        nzPlaceHolder="Select date"
                        style="width: 100%"
                      ></nz-date-picker>
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
                <nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="6">Next Follow-up</nz-form-label>
                    <nz-form-control [nzSpan]="18">
                      <nz-date-picker 
                        formControlName="nextFollowupAt" 
                        nzFormat="MMM dd, yyyy"
                        nzPlaceHolder="Select date"
                        style="width: 100%"
                      ></nz-date-picker>
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>

              <nz-row [nzGutter]="16">
                <nz-col nzSpan="24">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="3">Tags</nz-form-label>
                    <nz-form-control [nzSpan]="21">
                      <div class="tags-container">
                        <nz-tag 
                          *ngFor="let tag of tags()" 
                          nzMode="closeable" 
                          (nzOnClose)="removeTag(tag)"
                        >
                          {{ tag }}
                        </nz-tag>
                        <input 
                          nz-input 
                          placeholder="Add tag and press Enter" 
                          [(ngModel)]="newTag"
                          (keyup.enter)="addTag()"
                          class="tag-input"
                        />
                      </div>
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>

              <nz-row [nzGutter]="16">
                <nz-col nzSpan="24">
                  <nz-form-item>
                    <nz-form-label [nzSpan]="3">Notes</nz-form-label>
                    <nz-form-control [nzSpan]="21">
                      <textarea 
                        nz-input 
                        formControlName="notes" 
                        placeholder="Additional notes about the client"
                        [nzAutosize]="{ minRows: 3, maxRows: 6 }"
                      ></textarea>
                    </nz-form-control>
                  </nz-form-item>
                </nz-col>
              </nz-row>
            </nz-card>

            <!-- Form Actions -->
            <div class="form-actions">
              <nz-space nzSize="middle">
                <button nz-button nzType="primary" nzSize="large" [disabled]="!clientForm.valid" type="submit">
                  <span nz-icon nzType="save"></span>
                  {{ isEditMode() ? 'Update Client' : 'Create Client' }}
                </button>
                <button nz-button nzSize="large" type="button" (click)="onCancel()">
                  <span nz-icon nzType="close"></span>
                  Cancel
                </button>
              </nz-space>
            </div>
          </form>
        </nz-spin>
      </nz-card>
    </div>
  `,
  styles: [`
    .client-form-container {
      padding: 24px;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .form-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    .section-card {
      margin-bottom: 16px;
      background-color: #fafafa;
    }

    .section-card:last-child {
      margin-bottom: 0;
    }

    .form-actions {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;
      text-align: center;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .tag-input {
      width: 200px;
      margin-left: 8px;
    }

    nz-form-item {
      margin-bottom: 16px;
    }

    nz-form-label {
      font-weight: 500;
    }
  `]
})
export class ClientFormComponent implements OnInit, CanComponentDeactivate {
  @Input() clientId?: string;
  @Output() clientSaved = new EventEmitter<Client>();

  clientForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  tags = signal<string[]>([]);
  newTag = '';

  private fb = inject(FormBuilder);
  private clientsService = inject(ClientsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private message = inject(NzMessageService);
  private navigationService = inject(NavigationService);

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    // Get client ID from route parameters
    const routeClientId = this.route.snapshot.paramMap.get('id');
    const clientId = this.clientId || routeClientId;
    
    if (clientId) {
      this.isEditMode.set(true);
      this.loadClient(clientId);
    }
  }

  initializeForm() {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['COMPANY'],
      contactPerson: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      website: [''],
      taxNumber: [''],
      clientCode: [''],
      billingStreet: [''],
      billingCity: [''],
      billingZip: [''],
      billingCountry: [''],
      status: ['ACTIVE'],
      paymentTerms: ['D30'],
      preferredCurrency: ['BAM'],
      creditLimit: [0],
      leadSource: [''],
      lastContactedAt: [null],
      nextFollowupAt: [null],
      notes: ['']
    });
  }

  loadClient(clientId: string) {
    this.loading.set(true);
    this.clientsService.getClientById(clientId).subscribe({
      next: (client) => {
        this.populateForm(client);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.message.error('Failed to load client');
        this.loading.set(false);
      }
    });
  }

  populateForm(client: Client) {
    this.clientForm.patchValue({
      name: client.name,
      type: client.type,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      website: client.website,
      taxNumber: client.taxNumber,
      clientCode: client.clientCode,
      billingStreet: client.billingStreet,
      billingCity: client.billingCity,
      billingZip: client.billingZip,
      billingCountry: client.billingCountry,
      status: client.status,
      paymentTerms: client.paymentTerms,
      preferredCurrency: client.preferredCurrency,
      creditLimit: client.creditLimit,
      leadSource: client.leadSource,
      lastContactedAt: client.lastContactedAt ? new Date(client.lastContactedAt) : null,
      nextFollowupAt: client.nextFollowupAt ? new Date(client.nextFollowupAt) : null,
      notes: client.notes
    });
    this.tags.set(client.tags || []);
    
    // Mark form as pristine after loading data to prevent false "unsaved changes" warnings
    this.clientForm.markAsPristine();
  }

  addTag() {
    if (this.newTag.trim() && !this.tags().includes(this.newTag.trim())) {
      this.tags.set([...this.tags(), this.newTag.trim()]);
      this.newTag = '';
    }
  }

  removeTag(tag: string) {
    this.tags.set(this.tags().filter(t => t !== tag));
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.loading.set(true);
      
      const formValue = this.clientForm.value;
      const clientData: CreateClientRequest | UpdateClientRequest = {
        ...formValue,
        tags: this.tags(),
        lastContactedAt: formValue.lastContactedAt ? formValue.lastContactedAt.toISOString() : undefined,
        nextFollowupAt: formValue.nextFollowupAt ? formValue.nextFollowupAt.toISOString() : undefined
      };

      // Get client ID from route parameters or input
      const routeClientId = this.route.snapshot.paramMap.get('id');
      const clientId = this.clientId || routeClientId;

      const operation = this.isEditMode() 
        ? this.clientsService.updateClient(clientId!, clientData as UpdateClientRequest)
        : this.clientsService.createClient(clientData as CreateClientRequest);

      operation.subscribe({
        next: (client) => {
          this.message.success(`Client ${this.isEditMode() ? 'updated' : 'created'} successfully`);
          // Mark form as pristine after successful operation
          this.clientForm.markAsPristine();
          this.clientSaved.emit(client);
          this.navigationService.navigateToListPage();
        },
        error: (error) => {
          console.error('Error saving client:', error);
          this.message.error(`Failed to ${this.isEditMode() ? 'update' : 'create'} client`);
          this.loading.set(false);
        }
      });
    } else {
      this.message.error('Please fill in all required fields');
    }
  }

  onCancel() {
    this.navigationService.navigateToListPage();
  }

  onCurrencyChange() {
    // Trigger change detection to update currency formatter
    const currentValue = this.clientForm.get('creditLimit')?.value;
    if (currentValue !== null && currentValue !== undefined) {
      this.clientForm.get('creditLimit')?.setValue(currentValue);
    }
  }

  currencyFormatter = (value: number): string => {
    const currency = this.clientForm?.get('preferredCurrency')?.value || 'USD';
    
    // Different currencies have different symbol placement conventions
    switch (currency) {
      case 'USD':
        return `$${value}`;
      case 'EUR':
        return `${value}€`;
      case 'BAM':
        return `${value} KM`;
      default:
        return `$${value}`;
    }
  };

  currencyParser = (value: string): string => {
    const currency = this.clientForm?.get('preferredCurrency')?.value || 'USD';
    
    // Remove currency symbols based on the currency type
    switch (currency) {
      case 'USD':
        return value.replace(/\$\s?|(,*)/g, '');
      case 'EUR':
        return value.replace(/€\s?|(,*)/g, '');
      case 'BAM':
        return value.replace(/KM\s?|(,*)/g, '');
      default:
        return value.replace(/\$\s?|(,*)/g, '');
    }
  };

  canDeactivate(): boolean {
    // Only block if form is dirty AND we're not in the middle of a successful operation
    // This prevents blocking when form is marked dirty due to initialization or validation updates
    const hasUnsavedChanges = this.clientForm.dirty && !this.loading();
    
    console.log('ClientFormComponent: canDeactivate called', {
      formDirty: this.clientForm.dirty,
      loading: this.loading(),
      hasUnsavedChanges: hasUnsavedChanges
    });
    
    return !hasUnsavedChanges;
  }
}
