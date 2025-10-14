import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AttributesService, Attribute, CreateAttributeDto, AttributeOption } from '../../services/attributes.service';

@Component({
  selector: 'app-attributes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="attributes-container">
      <div class="header">
        <h2>Product Attributes</h2>
        <button 
          class="btn btn-primary" 
          (click)="openCreateModal()"
        >
          Add Attribute
        </button>
      </div>

      <div class="attributes-grid">
        <div 
          *ngFor="let attribute of attributes" 
          class="attribute-card"
        >
          <div class="attribute-header">
            <h3>{{ attribute.name }}</h3>
            <div class="attribute-actions">
              <button 
                class="btn btn-sm btn-secondary"
                (click)="openEditModal(attribute)"
              >
                Edit
              </button>
              <button 
                class="btn btn-sm btn-danger"
                (click)="deleteAttribute(attribute.id)"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div class="attribute-details">
            <p><strong>Type:</strong> 
              <span class="type-tag" [class]="'type-' + attribute.type.toLowerCase()">
                {{ attribute.type }}
              </span>
            </p>
            <p><strong>Options:</strong> {{ attribute.options?.length || 0 }}</p>
            <div *ngIf="attribute.options && attribute.options.length > 0" class="options-list">
              <span 
                *ngFor="let option of attribute.options" 
                class="option-tag"
              >
                {{ option.option }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="attributes.length === 0" class="no-attributes">
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

    .attributes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--spacing-lg);
    }

    .attribute-card {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-base);
      padding: var(--spacing-lg);
      background: var(--color-bg-container);
      box-shadow: var(--shadow-card);
    }

    .attribute-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }

    .attribute-header h3 {
      margin: 0;
      color: var(--color-text-base);
      font-size: 18px;
      font-weight: 600;
    }

    .attribute-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .attribute-details p {
      margin: var(--spacing-sm) 0;
      color: var(--color-text-base);
    }

    .attribute-details strong {
      color: var(--color-text-base);
    }

    .type-tag {
      padding: 2px var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: bold;
    }

    .type-text { 
      background: rgba(59, 130, 246, 0.1); 
      color: var(--color-primary); 
    }
    .type-number { 
      background: rgba(34, 197, 94, 0.1); 
      color: var(--color-success); 
    }
    .type-decimal { 
      background: rgba(245, 158, 11, 0.1); 
      color: var(--color-warning); 
    }
    .type-boolean { 
      background: rgba(147, 51, 234, 0.1); 
      color: #9333EA; 
    }
    .type-date { 
      background: rgba(248, 113, 113, 0.1); 
      color: var(--color-error); 
    }
    .type-enum { 
      background: rgba(6, 182, 212, 0.1); 
      color: #06B6D4; 
    }

    .options-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
    }

    .option-tag {
      background: var(--color-bg-base);
      color: var(--color-text-secondary);
      padding: 4px var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-size: 12px;
      border: 1px solid var(--color-border);
    }

    .no-attributes {
      text-align: center;
      padding: var(--spacing-2xl);
      color: var(--color-text-secondary);
    }

    .no-attributes a {
      color: var(--color-primary);
      text-decoration: none;
    }

    .no-attributes a:hover {
      text-decoration: underline;
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

  `]
})
export class AttributesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private attributesService = inject(AttributesService);

  attributes: Attribute[] = [];

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
  }

  loadAttributes() {
    this.attributesService.getAll().subscribe({
      next: (attributes) => {
        this.attributes = attributes;
        console.log('Attributes loaded:', this.attributes);
      },
      error: (error) => {
        console.error('Error loading attributes:', error);
        // Fallback to empty array if API fails
        this.attributes = [];
      }
    });
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
            const index = this.attributes.findIndex(a => a.id === this.editingAttribute.id);
            if (index !== -1) {
              this.attributes[index] = updatedAttribute;
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
            this.attributes.push(newAttribute);
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
          this.attributes = this.attributes.filter(a => a.id !== id);
          console.log('Attribute deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting attribute:', error);
          alert('Error deleting attribute. Please try again.');
        }
      });
    }
  }
}
