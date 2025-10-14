import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="categories-container">
      <div class="header">
        <h2>Product Categories</h2>
        <div class="header-actions">
          <button 
            class="btn btn-primary" 
            (click)="openCreateModal()"
          >
            Add Category
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="categories-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Parent</th>
              <th>Description</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of categories" [class.child-category]="category.parentId">
              <td>
                <span [style.padding-left.px]="getIndentLevel(category) * 20">
                  {{ category.name }}
                </span>
              </td>
              <td>{{ category.code }}</td>
              <td>{{ getParentName(category.parentId) }}</td>
              <td>{{ category.description || '-' }}</td>
              <td>{{ category.productCount || 0 }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn btn-sm btn-secondary"
                    (click)="openCreateChildModal(category)"
                    title="Add Child Category"
                  >
                    Add Child
                  </button>
                  <button 
                    class="btn btn-sm btn-primary"
                    (click)="openEditModal(category)"
                    title="Edit Category"
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-sm btn-danger"
                    (click)="deleteCategory(category.id)"
                    title="Delete Category"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="categories.length === 0" class="no-categories">
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
      padding: var(--spacing-lg);
      background: var(--color-bg-base);
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }

    .header h2 {
      margin: 0;
      color: var(--color-text-base);
      font-size: 24px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .table-container {
      background: var(--color-bg-container);
      border-radius: var(--radius-base);
      overflow: hidden;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
    }

    .categories-table {
      width: 100%;
      border-collapse: collapse;
    }

    .categories-table th {
      background: var(--color-bg-base);
      padding: var(--spacing-md);
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid var(--color-border);
      color: var(--color-text-base);
    }

    .categories-table td {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-bg-container);
      color: var(--color-text-base);
    }

    .categories-table tr:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .child-category {
      background: rgba(59, 130, 246, 0.05);
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
    }

    .no-categories {
      text-align: center;
      padding: var(--spacing-2xl);
      color: var(--color-text-secondary);
    }

    .no-categories a {
      color: var(--color-primary);
      text-decoration: none;
    }

    .no-categories a:hover {
      text-decoration: underline;
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
  private fb = inject(FormBuilder);

  categories: any[] = [
    { id: '1', name: 'Electronics', code: 'ELEC', description: 'Electronic products', productCount: 15, parentId: null },
    { id: '2', name: 'Smartphones', code: 'SMART', description: 'Mobile phones', productCount: 8, parentId: '1' },
    { id: '3', name: 'Laptops', code: 'LAPTOP', description: 'Portable computers', productCount: 5, parentId: '1' },
    { id: '4', name: 'Clothing', code: 'CLOTH', description: 'Clothing and apparel', productCount: 8, parentId: null },
    { id: '5', name: 'Food & Beverages', code: 'FOOD', description: 'Food and beverage products', productCount: 23, parentId: null },
  ];

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
      return this.categories.filter(cat => 
        cat.id !== this.editingCategory.id && 
        !this.isChildOf(cat, this.editingCategory)
      );
    }
    return this.categories.filter(cat => !cat.parentId);
  }

  ngOnInit() {
    // In a real app, you would load categories from a service
    console.log('Categories loaded:', this.categories);
  }

  getIndentLevel(category: any): number {
    if (!category.parentId) return 0;
    
    let level = 0;
    let currentParentId = category.parentId;
    
    while (currentParentId) {
      level++;
      const parent = this.categories.find(c => c.id === currentParentId);
      if (!parent) break;
      currentParentId = parent.parentId;
    }
    
    return level;
  }

  getParentName(parentId: string | null): string {
    if (!parentId) return '-';
    const parent = this.categories.find(c => c.id === parentId);
    return parent ? parent.name : '-';
  }

  isChildOf(category: any, potentialParent: any): boolean {
    if (!category.parentId) return false;
    if (category.parentId === potentialParent.id) return true;
    
    const parent = this.categories.find(c => c.id === category.parentId);
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
        const index = this.categories.findIndex(c => c.id === this.editingCategory.id);
        if (index !== -1) {
          this.categories[index] = { ...this.editingCategory, ...formData };
        }
      } else {
        // Create new category
        const newCategory = {
          id: (this.categories.length + 1).toString(),
          ...formData,
          productCount: 0
        };
        this.categories.push(newCategory);
      }
      
      this.closeModal();
    }
  }

  deleteCategory(id: string) {
    // Check if category has children
    const hasChildren = this.categories.some(c => c.parentId === id);
    if (hasChildren) {
      alert('Cannot delete category that has child categories. Please delete child categories first.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this category?')) {
      this.categories = this.categories.filter(c => c.id !== id);
    }
  }
}
