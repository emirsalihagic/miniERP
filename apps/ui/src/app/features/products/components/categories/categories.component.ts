import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, CellClickedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { NzIconModule } from 'ng-zorro-antd/icon';

// Register AG-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AgGridAngular, NzIconModule],
  template: `
    <div class="categories-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Product Categories</h1>
            <p>Manage product categories and their hierarchical structure</p>
          </div>
          <div class="header-actions">
            <button 
              class="btn btn-primary" 
              (click)="openCreateModal()"
            >
              <span nz-icon nzType="plus"></span>
              Add Category
            </button>
          </div>
        </div>
      </div>

      <!-- AG-Grid -->
      <div class="enterprise-grid">
        <ag-grid-angular
          [class]="gridClass"
          [rowData]="categories()"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
          (gridReady)="onGridReady($event)"
          (cellClicked)="onCellClicked($event)"
          style="width: 100%; height: 100%;"
        ></ag-grid-angular>
      </div>

      <!-- Empty State -->
      <div *ngIf="categories().length === 0" class="empty-state">
        <p>No categories found. <a href="#" (click)="openCreateModal(); $event.preventDefault()">Create your first category</a></p>
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
            <h3>{{ getModalTitle() }}</h3>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          
          <form 
            [formGroup]="categoryForm" 
            (ngSubmit)="saveCategory()"
            class="modal-body"
          >
            <div class="form-group">
              <label for="name">Name *</label>
              <input 
                id="name"
                type="text" 
                formControlName="name" 
                class="form-control"
                placeholder="Enter category name"
              >
              <div 
                *ngIf="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched"
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
                placeholder="Enter category code"
              >
              <div 
                *ngIf="categoryForm.get('code')?.invalid && categoryForm.get('code')?.touched"
                class="error-message"
              >
                Code is required
              </div>
            </div>

            <div class="form-group">
              <label for="parentId">Parent Category</label>
              <select 
                id="parentId"
                formControlName="parentId" 
                class="form-control"
              >
                <option value="">None (Root Category)</option>
                <option 
                  *ngFor="let parent of availableParents" 
                  [value]="parent.id"
                >
                  {{ parent.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description"
                formControlName="description" 
                class="form-control"
                rows="3"
                placeholder="Enter category description"
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
                [disabled]="!categoryForm.valid"
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
    .categories-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
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
export class CategoriesComponent implements OnInit {
  private fb = inject(FormBuilder)

  // Signals for reactive state
  categories = signal<any[]>([]);
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
        const category = params.data;
        return `
          <div class="category-info">
            <div class="category-name">
              <strong>${category.name}</strong>
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
      field: 'parentId',
      headerName: 'Parent',
      width: 150,
      cellRenderer: (params: any) => {
        const parentName = this.getParentName(params.value);
        return parentName || '-';
      }
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
      field: 'productCount',
      headerName: 'Products',
      width: 100,
      cellRenderer: (params: any) => {
        return params.value || 0;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const category = params.data;
        return `
          <div class="action-buttons">
            <button class="btn btn-sm btn-secondary" onclick="window.addChildCategory('${category.id}')" title="Add Child Category">
              <span nz-icon nzType="plus"></span>
              Add Child
            </button>
            <button class="btn btn-sm btn-primary" onclick="window.editCategory('${category.id}')" title="Edit Category">
              <span nz-icon nzType="edit"></span>
              Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="window.deleteCategory('${category.id}')" title="Delete Category">
              <span nz-icon nzType="delete"></span>
              Delete
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
    },
    suppressRowClickSelection: true,
    rowSelection: 'multiple',
    animateRows: true,
  };;

  showModal = false;
  isEditMode = false;
  editingCategory: any = null;
  parentCategory: any = null; // For creating child categories

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]],
    parentId: [''],
    description: [''],
  });

  get availableParents() {
    // Filter out the current category being edited and its children to prevent circular references
    if (this.isEditMode && this.editingCategory) {
      return this.categories().filter(cat => 
        cat.id !== this.editingCategory.id && 
        !this.isChildOf(cat, this.editingCategory)
      );
    }
    return this.categories().filter(cat => !cat.parentId);
  }

  ngOnInit() {
    this.loadCategories();
    this.setupGlobalHandlers();
  }

  loadCategories() {
    this.loading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.categories.set([
        { id: '1', name: 'Electronics', code: 'ELEC', description: 'Electronic products', productCount: 15, parentId: null },
        { id: '2', name: 'Smartphones', code: 'SMART', description: 'Mobile phones', productCount: 8, parentId: '1' },
        { id: '3', name: 'Laptops', code: 'LAPTOP', description: 'Portable computers', productCount: 5, parentId: '1' },
        { id: '4', name: 'Clothing', code: 'CLOTH', description: 'Clothing and apparel', productCount: 8, parentId: null },
        { id: '5', name: 'Food & Beverages', code: 'FOOD', description: 'Food and beverage products', productCount: 23, parentId: null },
      ]);
      this.loading.set(false);
    }, 500);
  }

  setupGlobalHandlers() {
    (window as any).addChildCategory = (id: string) => {
      const category = this.categories().find(c => c.id === id);
      if (category) {
        this.openCreateChildModal(category);
      }
    };

    (window as any).editCategory = (id: string) => {
      const category = this.categories().find(c => c.id === id);
      if (category) {
        this.openEditModal(category);
      }
    };

    (window as any).deleteCategory = (id: string) => {
      this.deleteCategory(id);
    };
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    
    // If categories are already loaded, set them in the grid
    if (this.categories().length > 0) {
      if (typeof event.api.setGridOption === 'function') {
        event.api.setGridOption('rowData', this.categories());
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

  getIndentLevel(category: any): number {
    if (!category.parentId) return 0;
    
    let level = 0;
    let currentParentId = category.parentId;
    
    while (currentParentId) {
      level++;
      const parent = this.categories().find(c => c.id === currentParentId);
      if (!parent) break;
      currentParentId = parent.parentId;
    }
    
    return level;
  }

  getParentName(parentId: string | null): string {
    if (!parentId) return '-';
    const parent = this.categories().find(c => c.id === parentId);
    return parent ? parent.name : '-';
  }

  isChildOf(category: any, potentialParent: any): boolean {
    if (!category.parentId) return false;
    if (category.parentId === potentialParent.id) return true;
    
    const parent = this.categories().find(c => c.id === category.parentId);
    return parent ? this.isChildOf(parent, potentialParent) : false;
  }

  getModalTitle(): string {
    if (this.isEditMode) return 'Edit Category';
    if (this.parentCategory) return `Add Child Category to ${this.parentCategory.name}`;
    return 'Add Category';
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingCategory = null;
    this.parentCategory = null;
    this.categoryForm.reset();
    this.showModal = true;
  }

  openCreateChildModal(parentCategory: any) {
    this.isEditMode = false;
    this.editingCategory = null;
    this.parentCategory = parentCategory;
    this.categoryForm.reset({ parentId: parentCategory.id });
    this.showModal = true;
  }

  openEditModal(category: any) {
    this.isEditMode = true;
    this.editingCategory = category;
    this.parentCategory = null;
    this.categoryForm.patchValue(category);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingCategory = null;
    this.parentCategory = null;
    this.categoryForm.reset();
  }

  saveCategory() {
    if (this.categoryForm.valid) {
      const formData = this.categoryForm.value;
      
      if (this.isEditMode && this.editingCategory) {
        // Update existing category
        const currentCategories = this.categories();
        const index = currentCategories.findIndex(c => c.id === this.editingCategory.id);
        if (index !== -1) {
          currentCategories[index] = { ...this.editingCategory, ...formData };
          this.categories.set([...currentCategories]);
        }
      } else {
        // Create new category
        const currentCategories = this.categories();
        const newCategory = {
          id: (currentCategories.length + 1).toString(),
          ...formData,
          productCount: 0
        };
        this.categories.set([...currentCategories, newCategory]);
      }
      
      this.closeModal();
    }
  }

  deleteCategory(id: string) {
    // Check if category has children
    const hasChildren = this.categories().some(c => c.parentId === id);
    if (hasChildren) {
      alert('Cannot delete category that has child categories. Please delete child categories first.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this category?')) {
      const currentCategories = this.categories();
      this.categories.set(currentCategories.filter(c => c.id !== id));
    }
  }
}
