import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AttributesService, Attribute, CreateAttributeDto, AttributeOption } from '../../services/attributes.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, CellClickedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { NzIconModule } from 'ng-zorro-antd/icon';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-attributes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AgGridAngular, NzIconModule],
  template: `
    <div class="attributes-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Product Attributes</h1>
            <p>Define custom attributes for your products</p>
          </div>
          <div class="header-actions">
            <button 
              class="btn btn-primary" 
              (click)="openCreateModal()"
            >
              <span nz-icon nzType="plus"></span>
              Add Attribute
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="quick-filters">
        <div class="filter-group">
          <label>Type:</label>
          <div class="filter-chips">
            <button 
              class="filter-chip" 
              [class.active]="typeFilter === 'ALL'" 
              (click)="setTypeFilter('ALL')">
              All
            </button>
            <button 
              class="filter-chip" 
              [class.active]="typeFilter === 'TEXT'" 
              (click)="setTypeFilter('TEXT')">
              Text
            </button>
            <button 
              class="filter-chip" 
              [class.active]="typeFilter === 'NUMBER'" 
              (click)="setTypeFilter('NUMBER')">
              Number
            </button>
            <button 
              class="filter-chip" 
              [class.active]="typeFilter === 'BOOLEAN'" 
              (click)="setTypeFilter('BOOLEAN')">
              Boolean
            </button>
            <button 
              class="filter-chip" 
              [class.active]="typeFilter === 'DATE'" 
              (click)="setTypeFilter('DATE')">
              Date
            </button>
            <button 
              class="filter-chip" 
              [class.active]="typeFilter === 'SELECT'" 
              (click)="setTypeFilter('SELECT')">
              List
            </button>
          </div>
        </div>
        
        <div class="filter-group">
          <label>Required:</label>
          <div class="filter-chips">
            <button 
              class="filter-chip" 
              [class.active]="requiredFilter === 'ALL'" 
              (click)="setRequiredFilter('ALL')">
              All
            </button>
            <button 
              class="filter-chip" 
              [class.active]="requiredFilter === 'REQUIRED'" 
              (click)="setRequiredFilter('REQUIRED')">
              Required
            </button>
            <button 
              class="filter-chip" 
              [class.active]="requiredFilter === 'OPTIONAL'" 
              (click)="setRequiredFilter('OPTIONAL')">
              Optional
            </button>
          </div>
        </div>
        
        <div class="filter-actions">
          <button class="clear-filters-btn" (click)="clearAllFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <!-- AG-Grid -->
      <div class="enterprise-grid">
        <ag-grid-angular
          [class]="gridClass"
          [rowData]="attributes()"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
          (gridReady)="onGridReady($event)"
          (cellClicked)="onCellClicked($event)"
          style="width: 100%; height: 100%;"
        ></ag-grid-angular>
      </div>

      <!-- Empty State -->
      <div *ngIf="attributes().length === 0" class="empty-state">
        <p>No attributes found. <a href="#" (click)="openCreateModal(); $event.preventDefault()">Create your first attribute</a></p>
      </div>

      <!-- Create/Edit Modal -->
      <div 
        *ngIf="showModal" 
        class="modal-overlay"
        (click)="closeModal()"
      >
        <div 
          class="modal-content"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header">
            <h3>{{ isEditMode ? 'Edit Attribute' : 'Add Attribute' }}</h3>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          
          <form 
            [formGroup]="attributeForm" 
            (ngSubmit)="saveAttribute()"
            class="modal-body"
          >
            <div class="form-group">
              <label for="name">Name *</label>
              <input 
                id="name"
                type="text" 
                formControlName="name" 
                class="form-control"
                placeholder="Enter attribute name"
              >
              <div 
                *ngIf="attributeForm.get('name')?.invalid && attributeForm.get('name')?.touched"
                class="error-message"
              >
                Name is required
              </div>
            </div>

            <div class="form-group">
              <label for="type">Type *</label>
              <select 
                id="type"
                formControlName="type" 
                class="form-control"
                (change)="onTypeChange()"
              >
                <option value="">Select attribute type</option>
                <option value="TEXT">Text</option>
                <option value="NUMBER">Number</option>
                <option value="DECIMAL">Decimal</option>
                <option value="BOOLEAN">Boolean</option>
                <option value="DATE">Date</option>
                <option value="LIST">List</option>
              </select>
              <div 
                *ngIf="attributeForm.get('type')?.invalid && attributeForm.get('type')?.touched"
                class="error-message"
              >
                Type is required
              </div>
            </div>

            <!-- Options for LIST type -->
            <div *ngIf="attributeForm.get('type')?.value === 'LIST'" class="form-group">
              <label>Options</label>
              <div formArrayName="options">
                <div 
                  *ngFor="let option of optionsArray.controls; let i = index" 
                  [formGroupName]="i"
                  class="option-row"
                >
                  <input 
                    type="text" 
                    formControlName="option" 
                    class="form-control"
                    placeholder="Option"
                  >
                  <button 
                    type="button" 
                    class="btn btn-sm btn-danger"
                    (click)="removeOption(i)"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <button 
                type="button" 
                class="btn btn-sm btn-secondary"
                (click)="addOption()"
              >
                Add Option
              </button>
            </div>

            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary"
                (click)="closeModal()"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="!attributeForm.valid"
              >
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attributes-container {
      display: flex;
      flex-direction: column;
      height: 90vh;
      background: var(--color-bg-base);
      padding: var(--spacing-lg);
    }

    .page-header {
      flex-shrink: 0;
      margin-bottom: var(--spacing-lg);
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--spacing-lg);
        
        .header-info {
          flex: 1;
          
          h1 {
            margin: 0 0 var(--spacing-sm) 0;
            font-size: 2rem;
            font-weight: 600;
            color: var(--color-text-base);
            line-height: 1.2;
          }
          
          p {
            margin: 0;
            color: var(--color-text-base);
            opacity: 0.7;
            font-size: 1rem;
            line-height: 1.5;
          }
        }
        
        .header-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-shrink: 0;
        }
      }
    }

    .enterprise-grid {
      flex: 1;
      min-height: 0;
      border: 1px solid #e5e7eb;
      border-radius: var(--radius-base);
      overflow: hidden;
      background: var(--color-bg-container);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--color-text-base);
      
      a {
        color: var(--color-primary);
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .option-row {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
      align-items: center;
    }

    .option-row .form-control {
      flex: 1;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--color-bg-container);
      border-radius: var(--radius-base);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
    }

    .modal-header h3 {
      margin: 0;
      color: var(--color-text-base);
    }


    .modal-body {
      padding: var(--spacing-lg);
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    .form-group label {
      display: block;
      margin-bottom: var(--spacing-xs);
      font-weight: 500;
      color: var(--color-text-base);
    }

    .form-control {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 14px;
      background: var(--color-bg-container);
      color: var(--color-text-base);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: var(--focus-ring);
    }

    .error-message {
      color: var(--color-error);
      font-size: 12px;
      margin-top: var(--spacing-xs);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
      border-top: 1px solid var(--color-border);
    }

    /* Quick Filters */
    .quick-filters {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-md) 0;
      margin-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      
      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        white-space: nowrap;
      }
    }

    .filter-chips {
      display: flex;
      gap: var(--spacing-xs);
      flex-wrap: wrap;
    }

    .filter-chip {
      padding: 6px 12px;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      background: var(--color-bg-container);
      color: var(--color-text-base);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      
      &:hover {
        border-color: var(--color-primary);
        background: var(--color-primary-bg);
        color: var(--color-primary);
      }
      
      &.active {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        
        &:hover {
          background: var(--color-primary-hover);
          border-color: var(--color-primary-hover);
        }
      }
    }

    .filter-actions {
      margin-left: auto;
    }

    .clear-filters-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 6px 12px;
      border: 1px solid var(--color-border);
      border-radius: 16px;
      background: var(--color-bg-container);
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--color-error);
        background: var(--color-error-bg);
        color: var(--color-error);
      }
    }
  `]
})
export class AttributesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private attributesService = inject(AttributesService);

  // Signals for reactive state
  attributes = signal<Attribute[]>([]);
  loading = signal(false);

  // AG-Grid properties
  isDarkMode: boolean = false;
  gridClass: string = 'ag-theme-alpine';
  gridApi: any = null;

  // Filter state
  typeFilter: string | 'ALL' = 'ALL';
  requiredFilter: string | 'ALL' = 'ALL';

  // AG-Grid column definitions
  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      minWidth: 200,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const attribute = params.data;
        return `
          <div class="attribute-info">
            <div class="attribute-name">
              <strong>${attribute.name}</strong>
            </div>
          </div>
        `;
      }
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      cellRenderer: (params: any) => {
        const type = params.value;
        const typeClass = `type-${type.toLowerCase()}`;
        return `<span class="type-tag ${typeClass}">${type}</span>`;
      }
    },
    {
      field: 'options',
      headerName: 'Options',
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => {
        const options = params.value || [];
        if (options.length === 0) return '-';
        return options.map((opt: any) => `<span class="option-tag">${opt.option}</span>`).join(' ');
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const attribute = params.data;
        return `
          <div class="action-buttons">
            <button class="action-btn edit-btn" onclick="window.editAttribute('${attribute.id}')" title="Edit Attribute">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="action-btn delete-btn" onclick="window.deleteAttribute('${attribute.id}')" title="Delete Attribute">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        `;
      }
    }
  ];

  // AG-Grid options
  gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      floatingFilter: false,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '400',
        color: '#181d1f',
        borderBottom: '1px solid #babfc7'
      },
      headerClass: 'custom-header'
    },
    suppressRowClickSelection: true,
    rowSelection: 'multiple',
    animateRows: true,
    // Custom no rows overlay
    overlayNoRowsTemplate: 'No matching criteria',
    rowHeight: 56,
    headerHeight: 48,
    suppressRowHoverHighlight: false,
    rowClassRules: {
      'row-hover': () => true
    },
    getRowStyle: (params) => {
      if (params.node?.rowIndex !== null && params.node.rowIndex % 2 === 0) {
        return { backgroundColor: '#ffffff' };
      } else {
        return { backgroundColor: '#f8f9fa' };
      }
    }
  };

  showModal = false;
  isEditMode = false;
  editingAttribute: any = null;

  attributeForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    type: ['', [Validators.required]],
    options: this.fb.array([])
  });

  get optionsArray() {
    return this.attributeForm.get('options') as FormArray;
  }

  ngOnInit() {
    this.loadAttributes();
    this.setupGlobalHandlers();
  }

  loadAttributes() {
    this.loading.set(true);
    this.attributesService.getAll().subscribe({
      next: (attributes) => {
        this.attributes.set(attributes);
        this.loading.set(false);
        console.log('Attributes loaded:', this.attributes());
      },
      error: (error) => {
        console.error('Error loading attributes:', error);
        this.attributes.set([]);
        this.loading.set(false);
      }
    });
  }

  setupGlobalHandlers() {
    (window as any).viewAttribute = (id: string) => {
      const attribute = this.attributes().find(a => a.id === id);
      if (attribute) {
        console.log('Viewing attribute:', attribute);
        // You can implement a view modal or navigate to a detail page
      }
    };
    
    (window as any).editAttribute = (id: string) => {
      const attribute = this.attributes().find(a => a.id === id);
      if (attribute) {
        this.openEditModal(attribute);
      }
    };

    (window as any).deleteAttribute = (id: string) => {
      this.deleteAttribute(id);
    };
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    
    // If attributes are already loaded, set them in the grid
    if (this.attributes().length > 0) {
      if (typeof event.api.setGridOption === 'function') {
        event.api.setGridOption('rowData', this.attributes());
        // Force grid refresh
        setTimeout(() => {
          this.gridApi.refreshCells();
        }, 100);
      }
    }
  }

  onCellClicked(event: CellClickedEvent) {
    // Handle cell clicks if needed
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingAttribute = null;
    this.attributeForm.reset();
    this.optionsArray.clear();
    this.showModal = true;
  }

  openEditModal(attribute: any) {
    this.isEditMode = true;
    this.editingAttribute = attribute;
    this.attributeForm.patchValue({
      name: attribute.name,
      type: attribute.type
    });
    
    this.optionsArray.clear();
    if (attribute.options) {
      attribute.options.forEach((option: any) => {
        this.addOption(option.option);
      });
    }
    
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingAttribute = null;
    this.attributeForm.reset();
    this.optionsArray.clear();
  }

  onTypeChange() {
    if (this.attributeForm.get('type')?.value !== 'LIST') {
      this.optionsArray.clear();
    }
  }

  addOption(option = '') {
    const optionGroup = this.fb.group({
      option: [option, [Validators.required]]
    });
    this.optionsArray.push(optionGroup);
  }

  removeOption(index: number) {
    this.optionsArray.removeAt(index);
  }

  saveAttribute() {
    if (this.attributeForm.valid) {
      const formData = this.attributeForm.value;
      const options = this.optionsArray.value.filter((opt: any) => opt.option && opt.option.trim());
      
      const attributeData: CreateAttributeDto = {
        name: formData.name,
        type: formData.type,
        options: formData.type === 'LIST' ? options : undefined
      };
      
      if (this.isEditMode && this.editingAttribute) {
        // Update existing attribute
        this.attributesService.update(this.editingAttribute.id, attributeData).subscribe({
          next: (updatedAttribute) => {
            const currentAttributes = this.attributes();
            const index = currentAttributes.findIndex(a => a.id === this.editingAttribute.id);
            if (index !== -1) {
              currentAttributes[index] = updatedAttribute;
              this.attributes.set([...currentAttributes]);
            }
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating attribute:', error);
            alert('Error updating attribute. Please try again.');
          }
        });
      } else {
        // Create new attribute
        this.attributesService.create(attributeData).subscribe({
          next: (newAttribute) => {
            const currentAttributes = this.attributes();
            this.attributes.set([...currentAttributes, newAttribute]);
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating attribute:', error);
            alert('Error creating attribute. Please try again.');
          }
        });
      }
    }
  }

  deleteAttribute(id: string) {
    if (confirm('Are you sure you want to delete this attribute?')) {
      this.attributesService.delete(id).subscribe({
        next: () => {
          const currentAttributes = this.attributes();
          this.attributes.set(currentAttributes.filter(a => a.id !== id));
          console.log('Attribute deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting attribute:', error);
          alert('Error deleting attribute. Please try again.');
        }
      });
    }
  }

  // Quick filter methods
  setTypeFilter(type: string | 'ALL') {
    this.typeFilter = type;
    this.applyClientSideFilters();
  }

  setRequiredFilter(required: string | 'ALL') {
    this.requiredFilter = required;
    this.applyClientSideFilters();
  }

  applyClientSideFilters() {
    if (this.gridApi) {
      // Clear existing filters first
      this.gridApi.setFilterModel(null);
      
      const filters: any = {};
      
      // Apply type filter if not 'ALL'
      if (this.typeFilter !== 'ALL') {
        filters.type = {
          type: 'equals',
          filter: this.typeFilter
        };
      }
      
      // Apply required filter if not 'ALL'
      if (this.requiredFilter !== 'ALL') {
        filters.isRequired = {
          type: 'equals',
          filter: this.requiredFilter === 'REQUIRED'
        };
      }
      
      // Apply filters if any exist
      if (Object.keys(filters).length > 0) {
        this.gridApi.setFilterModel(filters);
      }
    }
  }

  clearAllFilters() {
    this.typeFilter = 'ALL';
    this.requiredFilter = 'ALL';
    
    // Clear client-side filters
    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
    }
  }
}
