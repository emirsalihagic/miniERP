import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductGroupsService, ProductGroup, GroupAttribute } from '../../services/product-groups.service';
import { AttributesService, Attribute } from '../../services/attributes.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, CellClickedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { NzIconModule } from 'ng-zorro-antd/icon';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-product-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AgGridAngular, NzIconModule],
  template: `
    <div class="product-groups-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Product Groups</h1>
            <p>Organize products into groups with shared attributes</p>
          </div>
          <div class="header-actions">
            <button 
              class="btn btn-primary" 
              (click)="openCreateModal()"
            >
              <span nz-icon nzType="plus"></span>
              Add Product Group
            </button>
          </div>
        </div>
      </div>

      <!-- AG-Grid -->
      <div class="enterprise-grid">
        <ag-grid-angular
          [class]="gridClass"
          [rowData]="productGroups()"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
          (gridReady)="onGridReady($event)"
          (cellClicked)="onCellClicked($event)"
          style="width: 100%; height: 100%;"
        ></ag-grid-angular>
      </div>

      <!-- Empty State -->
      <div *ngIf="productGroups().length === 0" class="empty-state">
        <p>No product groups found. <a href="#" (click)="openCreateModal(); $event.preventDefault()">Create your first product group</a></p>
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
            <h3>{{ isEditMode ? 'Edit Product Group' : 'Add Product Group' }}</h3>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          
          <form 
            [formGroup]="groupForm" 
            (ngSubmit)="saveGroup()"
            class="modal-body"
          >
            <div class="form-group">
              <label for="name">Name *</label>
              <input 
                id="name"
                type="text" 
                formControlName="name" 
                class="form-control"
                placeholder="Enter group name"
              >
              <div 
                *ngIf="groupForm.get('name')?.invalid && groupForm.get('name')?.touched"
                class="error-message"
              >
                Name is required
              </div>
            </div>

            <div class="form-group">
              <label for="code">Code *</label>
              <input 
                id="code"
                type="text" 
                formControlName="code" 
                class="form-control"
                placeholder="Enter group code"
              >
              <div 
                *ngIf="groupForm.get('code')?.invalid && groupForm.get('code')?.touched"
                class="error-message"
              >
                Code is required
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description"
                formControlName="description" 
                class="form-control"
                rows="3"
                placeholder="Enter group description"
              ></textarea>
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
                [disabled]="!groupForm.valid"
              >
                {{ isEditMode ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Manage Attributes Modal -->
      <div 
        *ngIf="showAttributesModal" 
        class="modal-overlay"
        (click)="closeAttributesModal()"
      >
        <div 
          class="modal-content large-modal"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header">
            <h3>Manage Attributes for {{ selectedGroup?.name }}</h3>
            <button class="btn-close" (click)="closeAttributesModal()">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="attributes-section">
              <h4>Available Attributes</h4>
              <div class="attributes-list">
                <div 
                  *ngFor="let attribute of availableAttributes" 
                  class="attribute-item"
                >
                  <div class="attribute-info">
                    <strong>{{ attribute.name }}</strong>
                    <span class="attribute-type">{{ attribute.type }}</span>
                  </div>
                  <div class="attribute-controls">
                    <label class="checkbox-label">
                      <input 
                        type="checkbox" 
                        [checked]="isAttributeAssigned(attribute.id)"
                        (change)="toggleAttribute(attribute.id, $event)"
                      >
                      Required
                    </label>
                    <label class="checkbox-label">
                      <input 
                        type="checkbox" 
                        [checked]="isAttributeUnique(attribute.id)"
                        (change)="toggleUnique(attribute.id, $event)"
                      >
                      Unique
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="closeAttributesModal()"
            >
              Close
            </button>
            <button 
              type="button" 
              class="btn btn-primary"
              (click)="saveAttributeAssignments()"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-groups-container {
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

    .large-modal {
      max-width: 800px;
    }

    .attributes-section {
      margin-bottom: var(--spacing-lg);
    }

    .attributes-section h4 {
      color: var(--color-text-base);
      margin-bottom: var(--spacing-md);
    }

    .attributes-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-bg-container);
    }

    .attribute-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
    }

    .attribute-item:last-child {
      border-bottom: none;
    }

    .attribute-info {
      flex: 1;
    }

    .attribute-info strong {
      color: var(--color-text-base);
    }

    .attribute-type {
      background: var(--color-bg-base);
      color: var(--color-text-secondary);
      padding: 2px var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-size: 12px;
      margin-left: var(--spacing-sm);
      border: 1px solid var(--color-border);
    }

    .attribute-controls {
      display: flex;
      gap: var(--spacing-md);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 14px;
      cursor: pointer;
      color: var(--color-text-base);
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
      max-width: 500px;
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

  `]
})
export class ProductGroupsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private productGroupsService = inject(ProductGroupsService);
  private attributesService = inject(AttributesService);

  // Signals for reactive state
  productGroups = signal<ProductGroup[]>([]);
  loading = signal(false);

  // AG-Grid properties
  isDarkMode: boolean = false;
  gridClass: string = 'ag-theme-alpine';
  gridApi: any = null;

  // AG-Grid column definitions
  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      minWidth: 200,
      pinned: 'left',
      cellRenderer: (params: any) => {
        const group = params.data;
        return `
          <div class="group-info">
            <div class="group-name">
              <strong>${group.name}</strong>
            </div>
          </div>
        `;
      }
    },
    {
      field: 'code',
      headerName: 'Code',
      width: 120,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => {
        return params.value || '-';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const group = params.data;
        return `
          <div class="action-buttons">
            <button class="action-btn create-btn" onclick="window.createProductFromGroup('${group.id}')" title="Create Product from Group">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
            <button class="action-btn settings-btn" onclick="window.manageAttributes('${group.id}')" title="Manage Attributes">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </button>
            <button class="action-btn edit-btn" onclick="window.editGroup('${group.id}')" title="Edit Group">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="action-btn delete-btn" onclick="window.deleteGroup('${group.id}')" title="Delete Group">
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

  availableAttributes: Attribute[] = [];

  showModal = false;
  showAttributesModal = false;
  isEditMode = false;
  editingGroup: ProductGroup | null = null;
  selectedGroup: ProductGroup | null = null;
  groupAttributes: GroupAttribute[] = [];
  originallyAssignedAttributes: GroupAttribute[] = []; // Track original assignments

  groupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]],
    description: [''],
  });

  ngOnInit() {
    this.loadProductGroups();
    this.loadAvailableAttributes();
    this.setupGlobalHandlers();
  }

  loadProductGroups() {
    this.loading.set(true);
    this.productGroupsService.getAll().subscribe({
      next: (groups) => {
        this.productGroups.set(groups);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading product groups:', error);
        this.productGroups.set([]);
        this.loading.set(false);
      }
    });
  }

  loadAvailableAttributes() {
    this.attributesService.getAll().subscribe({
      next: (attributes) => {
        this.availableAttributes = attributes;
      },
      error: (error) => {
        console.error('Error loading attributes:', error);
        this.availableAttributes = [];
      }
    });
  }

  setupGlobalHandlers() {
    (window as any).createProductFromGroup = (id: string) => {
      const group = this.productGroups().find(g => g.id === id);
      if (group) {
        this.createProductFromGroup(group);
      }
    };

    (window as any).manageAttributes = (id: string) => {
      const group = this.productGroups().find(g => g.id === id);
      if (group) {
        this.openManageAttributesModal(group);
      }
    };

    (window as any).editGroup = (id: string) => {
      const group = this.productGroups().find(g => g.id === id);
      if (group) {
        this.openEditModal(group);
      }
    };

    (window as any).deleteGroup = (id: string) => {
      this.deleteGroup(id);
    };
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    
    // If product groups are already loaded, set them in the grid
    if (this.productGroups().length > 0) {
      if (typeof event.api.setGridOption === 'function') {
        event.api.setGridOption('rowData', this.productGroups());
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
    this.editingGroup = null;
    this.groupForm.reset();
    this.showModal = true;
  }

  openEditModal(group: any) {
    this.isEditMode = true;
    this.editingGroup = group;
    this.groupForm.patchValue(group);
    this.showModal = true;
  }

  openManageAttributesModal(group: any) {
    this.selectedGroup = group;
    this.loadGroupAttributes(group.id);
    this.showAttributesModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingGroup = null;
    this.groupForm.reset();
  }

  closeAttributesModal() {
    this.showAttributesModal = false;
    this.selectedGroup = null;
    this.groupAttributes = [];
    this.originallyAssignedAttributes = [];
  }

  loadGroupAttributes(groupId: string) {
    this.productGroupsService.getGroupAttributes(groupId).subscribe({
      next: (groupAttributes) => {
        this.groupAttributes = groupAttributes;
        this.originallyAssignedAttributes = [...groupAttributes]; // Store original assignments
      },
      error: (error) => {
        console.error('Error loading group attributes:', error);
        this.groupAttributes = [];
        this.originallyAssignedAttributes = [];
      }
    });
  }

  isAttributeAssigned(attributeId: string): boolean {
    return this.groupAttributes.some(ga => ga.attributeId === attributeId);
  }

  isAttributeUnique(attributeId: string): boolean {
    const ga = this.groupAttributes.find(ga => ga.attributeId === attributeId);
    return ga ? ga.uniqueInGroup : false;
  }

  toggleAttribute(attributeId: string, event: any) {
    if (event.target.checked) {
      if (!this.isAttributeAssigned(attributeId)) {
        this.groupAttributes.push({
          groupId: this.selectedGroup!.id,
          attributeId,
          required: false,
          uniqueInGroup: false
        });
      }
    } else {
      this.groupAttributes = this.groupAttributes.filter(ga => ga.attributeId !== attributeId);
    }
  }

  toggleUnique(attributeId: string, event: any) {
    const ga = this.groupAttributes.find(ga => ga.attributeId === attributeId);
    if (ga) {
      ga.uniqueInGroup = event.target.checked;
    }
  }

  saveGroup() {
    if (this.groupForm.valid) {
      const formData = this.groupForm.value;
      
      if (this.isEditMode && this.editingGroup) {
        // Update existing group
        this.productGroupsService.update(this.editingGroup.id, formData).subscribe({
          next: (updatedGroup) => {
            const currentGroups = this.productGroups();
            const index = currentGroups.findIndex(g => g.id === this.editingGroup!.id);
            if (index !== -1) {
              currentGroups[index] = updatedGroup;
              this.productGroups.set([...currentGroups]);
            }
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating product group:', error);
          }
        });
      } else {
        // Create new group
        this.productGroupsService.create(formData).subscribe({
          next: (newGroup) => {
            const currentGroups = this.productGroups();
            this.productGroups.set([...currentGroups, newGroup]);
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating product group:', error);
          }
        });
      }
    }
  }

  saveAttributeAssignments() {
    if (this.selectedGroup) {
      // Get the originally assigned attribute IDs
      const originallyAssignedIds = this.originallyAssignedAttributes.map(ga => ga.attributeId);
      
      // Find NEW assignments (in current selection but not in original)
      const newAssignments = this.groupAttributes
        .filter(ga => !originallyAssignedIds.includes(ga.attributeId))
        .map(ga => ({
          attributeId: ga.attributeId,
          required: ga.required,
          uniqueInGroup: ga.uniqueInGroup,
          sortOrder: ga.sortOrder || 0
        }));

      // Find REMOVED assignments (in original but not in current selection)
      const removedAssignments = this.originallyAssignedAttributes
        .filter(ga => !this.groupAttributes.some(current => current.attributeId === ga.attributeId));

      console.log('New assignments:', newAssignments);
      console.log('Removed assignments:', removedAssignments);

      if (newAssignments.length === 0 && removedAssignments.length === 0) {
        console.log('No changes to save');
        this.closeAttributesModal();
        return;
      }

      // Handle removals first
      if (removedAssignments.length > 0) {
        console.log('Removing attributes:', removedAssignments.map(ra => ra.attributeId));
        
        // Remove each attribute individually
        const removalPromises = removedAssignments.map(removedAttr => 
          this.productGroupsService.removeAttribute(this.selectedGroup!.id, removedAttr.attributeId).toPromise()
        );
        
        Promise.all(removalPromises).then(() => {
          console.log('All attributes removed successfully');
          
          // After removals, handle new assignments if any
          if (newAssignments.length > 0) {
            this.handleNewAssignments(newAssignments);
          } else {
            // Only removals, reload and close
            this.loadGroupAttributes(this.selectedGroup!.id);
            this.closeAttributesModal();
          }
        }).catch(error => {
          console.error('Error removing attributes:', error);
        });
      } else if (newAssignments.length > 0) {
        // Only new assignments
        this.handleNewAssignments(newAssignments);
      }
    }
  }

  private handleNewAssignments(newAssignments: any[]) {
    console.log('Adding new attributes:', newAssignments.map(na => na.attributeId));
    this.productGroupsService.assignAttributes(this.selectedGroup!.id, newAssignments).subscribe({
      next: (result) => {
        console.log('New attributes assigned successfully:', result);
        // Reload the group attributes to get the updated list
        this.loadGroupAttributes(this.selectedGroup!.id);
        this.closeAttributesModal();
      },
      error: (error) => {
        console.error('Error assigning attributes:', error);
        // Don't close the modal on error so user can see what went wrong
      }
    });
  }

  createProductFromGroup(group: ProductGroup) {
    // Navigate to product creation form with group pre-selected
    this.router.navigate(['/products/new'], { 
      queryParams: { 
        groupId: group.id, 
        groupName: group.name 
      } 
    });
  }

  deleteGroup(id: string) {
    if (confirm('Are you sure you want to delete this product group?')) {
      this.productGroupsService.delete(id).subscribe({
        next: () => {
          const currentGroups = this.productGroups();
          this.productGroups.set(currentGroups.filter(g => g.id !== id));
        },
        error: (error) => {
          console.error('Error deleting product group:', error);
        }
      });
    }
  }
}
