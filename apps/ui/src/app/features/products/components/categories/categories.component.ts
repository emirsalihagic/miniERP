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
        <p>No categories found. <a href="#" (click)="openCreateModal()">Create your first category</a></p>
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
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .categories-table {
      width: 100%;
      border-collapse: collapse;
    }

    .categories-table th {
      background: #f8f9fa;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }

    .categories-table td {
      padding: 15px;
      border-bottom: 1px solid #dee2e6;
    }

    .categories-table tr:hover {
      background: #f8f9fa;
    }

    .child-category {
      background: #f8f9fa;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .no-categories {
      text-align: center;
      padding: 40px;
      color: #6c757d;
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
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #ddd;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }

    .modal-body {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid #ddd;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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
