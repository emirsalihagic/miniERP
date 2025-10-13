import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductGroupsService, ProductGroup, GroupAttribute } from '../../services/product-groups.service';
import { AttributesService, Attribute } from '../../services/attributes.service';

@Component({
  selector: 'app-product-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="product-groups-container">
      <div class="header">
        <h2>Product Groups</h2>
        <div class="header-actions">
          <button 
            class="btn btn-primary" 
            (click)="openCreateModal()"
          >
            Add Product Group
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="product-groups-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let group of productGroups">
              <td>{{ group.name }}</td>
              <td>{{ group.code }}</td>
              <td>{{ group.description || '-' }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn btn-sm btn-success"
                    (click)="createProductFromGroup(group)"
                    title="Create Product from Group"
                  >
                    Create Product
                  </button>
                  <button 
                    class="btn btn-sm btn-secondary"
                    (click)="openManageAttributesModal(group)"
                    title="Manage Attributes"
                  >
                    Attributes
                  </button>
                  <button 
                    class="btn btn-sm btn-primary"
                    (click)="openEditModal(group)"
                    title="Edit Group"
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-sm btn-danger"
                    (click)="deleteGroup(group.id)"
                    title="Delete Group"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="productGroups.length === 0" class="no-groups">
        <p>No product groups found. <a href="#" (click)="openCreateModal()">Create your first product group</a></p>
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

    .product-groups-table {
      width: 100%;
      border-collapse: collapse;
    }

    .product-groups-table th {
      background: #f8f9fa;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }

    .product-groups-table td {
      padding: 15px;
      border-bottom: 1px solid #dee2e6;
    }

    .product-groups-table tr:hover {
      background: #f8f9fa;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .no-groups {
      text-align: center;
      padding: 40px;
      color: #6c757d;
    }

    .large-modal {
      max-width: 800px;
    }

    .attributes-section {
      margin-bottom: 20px;
    }

    .attributes-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }

    .attribute-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #dee2e6;
    }

    .attribute-item:last-child {
      border-bottom: none;
    }

    .attribute-info {
      flex: 1;
    }

    .attribute-type {
      background: #e9ecef;
      color: #495057;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 10px;
    }

    .attribute-controls {
      display: flex;
      gap: 15px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      cursor: pointer;
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

    .btn-success {
      background: #28a745;
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
export class ProductGroupsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private productGroupsService = inject(ProductGroupsService);
  private attributesService = inject(AttributesService);

  productGroups: ProductGroup[] = [];
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
  }

  loadProductGroups() {
    this.productGroupsService.getAll().subscribe({
      next: (groups) => {
        this.productGroups = groups;
      },
      error: (error) => {
        console.error('Error loading product groups:', error);
        this.productGroups = [];
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
            const index = this.productGroups.findIndex(g => g.id === this.editingGroup!.id);
            if (index !== -1) {
              this.productGroups[index] = updatedGroup;
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
            this.productGroups.push(newGroup);
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
          this.productGroups = this.productGroups.filter(g => g.id !== id);
        },
        error: (error) => {
          console.error('Error deleting product group:', error);
        }
      });
    }
  }
}
