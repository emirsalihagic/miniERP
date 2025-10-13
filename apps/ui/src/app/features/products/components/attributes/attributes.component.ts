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
        <p>No attributes found. <a href="#" (click)="openCreateModal()">Create your first attribute</a></p>
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
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .attributes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .attribute-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .attribute-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .attribute-actions {
      display: flex;
      gap: 8px;
    }

    .attribute-details p {
      margin: 8px 0;
    }

    .type-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .type-text { background: #e3f2fd; color: #1976d2; }
    .type-number { background: #e8f5e8; color: #388e3c; }
    .type-decimal { background: #fff3e0; color: #f57c00; }
    .type-boolean { background: #f3e5f5; color: #7b1fa2; }
    .type-date { background: #fce4ec; color: #c2185b; }
    .type-enum { background: #e0f2f1; color: #00695c; }

    .options-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .option-tag {
      background: #e9ecef;
      color: #495057;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .no-attributes {
      text-align: center;
      padding: 40px;
      color: #6c757d;
    }

    .option-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
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
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
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
