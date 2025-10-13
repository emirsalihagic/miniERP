import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsService, Product, CreateProductDto } from '../../services/products.service';
import { ProductGroupsService, ProductGroup, GroupAttribute } from '../../services/product-groups.service';
import { AttributesService, Attribute, AttributeOption } from '../../services/attributes.service';
import { UnitsService, Unit } from '../../../units/services/units.service';
import { SuppliersService, Supplier } from '../../services/suppliers.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="product-form-container">
      <div class="header">
        <h2>{{ getFormTitle() }}</h2>
        <div class="header-info" *ngIf="selectedGroup">
          <span class="group-badge">Creating from Group: {{ selectedGroup.name }}</span>
        </div>
        <button 
          class="btn btn-secondary" 
          (click)="goBack()"
        >
          Back to Products
        </button>
      </div>

      <!-- Error Messages Display -->
      <div *ngIf="errorMessages.length > 0" class="alert alert-danger" #errorAlert>
        <div class="error-header">
          <strong>Error{{ errorMessages.length > 1 ? 's' : '' }}:</strong>
          <button type="button" class="btn-close" (click)="clearErrors()" aria-label="Close"></button>
        </div>
        <ul class="error-list">
          <li *ngFor="let error of errorMessages">{{ error }}</li>
        </ul>
      </div>

      <form 
        [formGroup]="productForm" 
        (ngSubmit)="saveProduct()"
        class="product-form"
      >
        <div class="form-section">
          <h3>Basic Information</h3>
          
          <div class="form-group">
            <label for="name">Product Name *</label>
            <input 
              id="name"
              type="text" 
              formControlName="name" 
              class="form-control"
              placeholder="Enter product name"
            >
            <div 
              *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched"
              class="error-message"
            >
              Product name is required
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description"
              formControlName="description" 
              class="form-control"
              rows="3"
              placeholder="Enter product description"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="sku">SKU</label>
            <input 
              id="sku"
              type="text" 
              formControlName="sku" 
              class="form-control"
              placeholder="Enter SKU"
            >
          </div>

          <div class="form-group">
            <label for="barcode">Barcode</label>
            <input 
              id="barcode"
              type="text" 
              formControlName="barcode" 
              class="form-control"
              placeholder="Enter barcode"
            >
          </div>
        </div>

        <div class="form-section">
          <h3>Product Details</h3>
          
          <div class="form-group">
            <label for="status">Status *</label>
            <select 
              id="status"
              formControlName="status" 
              class="form-control"
            >
              <option value="">Select status</option>
              <option value="REGISTRATION">Registration</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="STAND_BY">Stand By</option>
            </select>
            <div 
              *ngIf="productForm.get('status')?.invalid && productForm.get('status')?.touched"
              class="error-message"
            >
              Status is required
            </div>
          </div>

          <div class="form-group">
            <label for="storageType">Storage Type *</label>
            <select 
              id="storageType"
              formControlName="storageType" 
              class="form-control"
            >
              <option value="">Select storage type</option>
              <option value="DRY">Dry</option>
              <option value="FROZEN">Frozen</option>
              <option value="HOT_STORAGE">Hot Storage</option>
              <option value="CHILLED">Chilled</option>
              <option value="LIVE">Live</option>
              <option value="DEEP_FROZEN">Deep Frozen</option>
              <option value="AMBIENT">Ambient</option>
              <option value="HAZMAT">Hazmat</option>
            </select>
            <div 
              *ngIf="productForm.get('storageType')?.invalid && productForm.get('storageType')?.touched"
              class="error-message"
            >
              Storage type is required
            </div>
          </div>

          <div class="form-group">
            <label for="brand">Brand</label>
            <input 
              id="brand"
              type="text" 
              formControlName="brand" 
              class="form-control"
              placeholder="Enter brand name"
            >
          </div>

          <div class="form-group">
            <label for="weightPerItem">Weight per Item</label>
            <input 
              id="weightPerItem"
              type="number" 
              formControlName="weightPerItem" 
              class="form-control"
              step="0.01"
              min="0"
              placeholder="Enter weight per item"
            >
          </div>

          <div class="form-group">
            <label for="shelfLifeDays">Shelf Life (Days)</label>
            <input 
              id="shelfLifeDays"
              type="number" 
              formControlName="shelfLifeDays" 
              class="form-control"
              min="0"
              placeholder="Enter shelf life in days"
            >
          </div>

          <div class="form-group">
            <label for="unitId">Unit *</label>
            <select 
              id="unitId"
              formControlName="unitId" 
              class="form-control"
            >
              <option value="">Select unit</option>
              <option *ngFor="let unit of units" [value]="unit.id">{{ unit.name }} ({{ unit.code }})</option>
            </select>
            <div 
              *ngIf="productForm.get('unitId')?.invalid && productForm.get('unitId')?.touched"
              class="error-message"
            >
              Unit is required
            </div>
          </div>

          <div class="form-group">
            <label for="supplierId">Supplier *</label>
            <select 
              id="supplierId"
              formControlName="supplierId" 
              class="form-control"
            >
              <option value="">Select supplier</option>
              <option *ngFor="let supplier of suppliers" [value]="supplier.id">{{ supplier.name }}</option>
            </select>
            <div 
              *ngIf="productForm.get('supplierId')?.invalid && productForm.get('supplierId')?.touched"
              class="error-message"
            >
              Supplier is required
            </div>
          </div>
        </div>

        <!-- Dynamic Attributes Section -->
        <div class="form-section" *ngIf="selectedGroup && groupAttributes.length > 0">
          <h3>Product Attributes (Grouped)</h3>
          <p class="section-description">Define the specific values for this product variant</p>
          
          <div class="attributes-container">
            <div 
              *ngFor="let groupAttr of groupAttributes; let i = index" 
              class="attribute-group"
            >
              <div class="attribute-header">
                <label class="attribute-label">
                  {{ groupAttr.attribute?.name || 'Loading...' }} 
                  <span *ngIf="groupAttr.required" class="required">*</span>
                  <span class="attribute-type">({{ groupAttr.attribute?.type || 'Loading...' }})</span>
                </label>
                <div class="attribute-info">
                  <span *ngIf="groupAttr.uniqueInGroup" class="unique-badge">Unique</span>
                </div>
              </div>
              
              <!-- Text Input -->
              <input 
                *ngIf="groupAttr.attribute?.type === 'TEXT'"
                type="text" 
                [formControlName]="'attribute_' + groupAttr.attributeId"
                class="form-control"
                [placeholder]="'Enter ' + (groupAttr.attribute?.name || 'value').toLowerCase()"
              >
              
              <!-- Number Input -->
              <input 
                *ngIf="groupAttr.attribute?.type === 'NUMBER'"
                type="number" 
                [formControlName]="'attribute_' + groupAttr.attributeId"
                class="form-control"
                [placeholder]="'Enter ' + (groupAttr.attribute?.name || 'value').toLowerCase()"
              >
              
              <!-- Decimal Input -->
              <input 
                *ngIf="groupAttr.attribute?.type === 'DECIMAL'"
                type="number" 
                step="0.01"
                [formControlName]="'attribute_' + groupAttr.attributeId"
                class="form-control"
                [placeholder]="'Enter ' + (groupAttr.attribute?.name || 'value').toLowerCase()"
              >
              
              <!-- Boolean Input -->
              <select 
                *ngIf="groupAttr.attribute?.type === 'BOOLEAN'"
                [formControlName]="'attribute_' + groupAttr.attributeId"
                class="form-control"
              >
                <option value="">Select {{ groupAttr.attribute?.name || 'value' }}</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              
              <!-- Date Input -->
              <input 
                *ngIf="groupAttr.attribute?.type === 'DATE'"
                type="date" 
                [formControlName]="'attribute_' + groupAttr.attributeId"
                class="form-control"
              >
              
              <!-- List Select -->
              <select 
                *ngIf="groupAttr.attribute?.type === 'LIST'"
                [formControlName]="'attribute_' + groupAttr.attributeId"
                class="form-control"
              >
                <option value="">Select {{ groupAttr.attribute?.name || 'value' }}</option>
                <option 
                  *ngFor="let option of groupAttr.attribute?.options" 
                  [value]="getOptionValue(option)"
                >
                  {{ getOptionValue(option) }}
                </option>
              </select>
              
              <div 
                *ngIf="productForm.get('attribute_' + groupAttr.attributeId)?.invalid && productForm.get('attribute_' + groupAttr.attributeId)?.touched"
                class="error-message"
              >
                {{ groupAttr.attribute?.name || 'This field' }} is required
              </div>
            </div>
          </div>
        </div>

        <!-- Attribute Selection Section for Individual Products -->
        <div class="form-section" *ngIf="!selectedGroup">
          <h3>Product Attributes (Individual)</h3>
          <p class="section-description">Edit or remove attributes assigned to this individual product</p>
          
          <!-- Show assigned attributes -->
          <div class="product-attributes-list" *ngIf="productAttributes.length > 0">
            <h4>Assigned Attributes</h4>
            <div 
              *ngFor="let attr of productAttributes; let i = index" 
              class="product-attribute-item"
            >
              <div class="attribute-info">
                <strong>{{ attr.attribute.name }}:</strong>
              </div>
              <div class="attribute-value-input">
                <!-- Text Input -->
                <input 
                  *ngIf="attr.attribute.type === 'TEXT'"
                  type="text" 
                  [value]="attr.value"
                  (input)="onInputChange(attr, $event)"
                  class="form-control"
                  [placeholder]="'Enter ' + attr.attribute.name.toLowerCase()"
                >
                
                <!-- Number Input -->
                <input 
                  *ngIf="attr.attribute.type === 'NUMBER'"
                  type="number" 
                  [value]="attr.value"
                  (input)="onInputChange(attr, $event)"
                  class="form-control"
                  [placeholder]="'Enter ' + attr.attribute.name.toLowerCase()"
                >
                
                <!-- Decimal Input -->
                <input 
                  *ngIf="attr.attribute.type === 'DECIMAL'"
                  type="number" 
                  step="0.01"
                  [value]="attr.value"
                  (input)="onInputChange(attr, $event)"
                  class="form-control"
                  [placeholder]="'Enter ' + attr.attribute.name.toLowerCase()"
                >
                
                <!-- Boolean Input -->
                <select 
                  *ngIf="attr.attribute.type === 'BOOLEAN'"
                  [value]="attr.value"
                  (change)="onSelectChange(attr, $event)"
                  class="form-control"
                >
                  <option value="">Select value</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                
                <!-- Date Input -->
                <input 
                  *ngIf="attr.attribute.type === 'DATE'"
                  type="date" 
                  [value]="attr.value"
                  (change)="onInputChange(attr, $event)"
                  class="form-control"
                >
                
                <!-- List Input -->
                <select 
                  *ngIf="attr.attribute.type === 'LIST'"
                  [value]="attr.value"
                  (change)="onSelectChange(attr, $event)"
                  class="form-control"
                >
                  <option value="">Select value</option>
                  <option 
                    *ngFor="let option of attr.attribute.options" 
                    [value]="getOptionValue(option)"
                    [selected]="isValueSelected(attr, option)"
                  >
                    {{ getOptionValue(option) }}
                  </option>
                </select>
              </div>
              <button 
                type="button" 
                class="btn btn-danger btn-sm"
                (click)="removeProductAttribute(i)"
              >
                Remove
              </button>
            </div>
          </div>
          
          <!-- Show message if no attributes assigned -->
          <div class="no-attributes-message" *ngIf="productAttributes.length === 0">
            <p class="text-muted">No attributes assigned to this product.</p>
          </div>

          <!-- Add New Attribute Section -->
          <div class="add-attribute-section" *ngIf="availableAttributes.length > 0">
            <h4>Add New Attribute</h4>
            <div class="add-attribute-form">
              <div class="form-group">
                <label for="selectedAttribute">Select Attribute</label>
                <select 
                  id="selectedAttribute"
                  [value]="selectedAttributeId"
                  (change)="onAttributeSelectionChange($event)"
                  class="form-control"
                >
                  <option value="">Choose an attribute to add</option>
                <option 
                  *ngFor="let attr of availableAttributes" 
                  [value]="attr.id"
                >
                  {{ attr.name }}
                </option>
                </select>
              </div>
              
              
              <button 
                type="button" 
                class="btn btn-primary btn-sm"
                (click)="addProductAttribute()"
                [disabled]="!selectedAttributeId"
              >
                Add Attribute
              </button>
            </div>
          </div>
          
          <!-- Show message if no more attributes available -->
          <div class="no-more-attributes-message" *ngIf="availableAttributes.length === 0 && productAttributes.length > 0">
            <p class="text-muted">All available attributes have been assigned to this product.</p>
          </div>
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="goBack()"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="!productForm.valid || isLoading"
          >
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ isLoading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .product-form-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .form-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .form-section h3 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
      padding-top: 20px;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .header-info {
      margin-left: 20px;
    }

    .group-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
    }

    .section-description {
      color: #6c757d;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .attributes-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .attribute-group {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      background: white;
    }

    .attribute-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .attribute-label {
      font-weight: 600;
      color: #333;
    }

    .required {
      color: #dc3545;
    }

    .attribute-type {
      color: #6c757d;
      font-weight: normal;
      font-size: 12px;
    }

    .attribute-info {
      display: flex;
      gap: 8px;
    }

    .unique-badge, .name-badge {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
    }

    .unique-badge {
      background: #fff3cd;
      color: #856404;
    }

    .name-badge {
      background: #d1ecf1;
      color: #0c5460;
    }

    .manual-attributes-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .add-attribute-section {
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 20px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      background: white;
      margin-top: 20px;
    }

    .add-attribute-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .add-attribute-form .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .add-attribute-form .form-group label {
      font-weight: 500;
      color: #333;
    }

    .no-more-attributes-message {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      text-align: center;
    }

    .text-muted {
      color: #6c757d;
      font-style: italic;
    }

    .manual-attributes-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .manual-attribute-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      background: #f8f9fa;
    }

    .product-attribute-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      background: white;
      gap: 10px;
      margin-bottom: 10px;
    }

    .product-attribute-item .attribute-info {
      flex: 0 0 200px;
      font-size: 14px;
    }

    .product-attribute-item .attribute-value-input {
      flex: 1;
      min-width: 150px;
    }

    .product-attribute-item .attribute-value-input .form-control {
      margin: 0;
    }

    .attribute-info {
      flex: 1;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }

    .alert {
      padding: 12px 16px;
      margin-bottom: 20px;
      border: 1px solid transparent;
      border-radius: 6px;
    }

    .alert-danger {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }

    .error-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .error-list {
      margin: 0;
      padding-left: 20px;
    }

    .error-list li {
      margin-bottom: 4px;
    }

    .error-list li:last-child {
      margin-bottom: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #721c24;
      padding: 0;
    }

    .btn-close:hover {
      opacity: 0.7;
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }

    .me-2 {
      margin-right: 0.5rem;
    }
  `]
})
export class ProductFormComponent implements OnInit, AfterViewInit {
  private productsService = inject(ProductsService);
  private productGroupsService = inject(ProductGroupsService);
  private attributesService = inject(AttributesService);
  private unitsService = inject(UnitsService);
  private suppliersService = inject(SuppliersService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  productId: string | null = null;
  selectedGroup: ProductGroup | null = null;
  groupAttributes: GroupAttribute[] = [];
  productAttributes: any[] = [];
  availableAttributes: Attribute[] = [];
  selectedAttributeId: string = '';
  newAttributeValue: string = '';
  errorMessages: string[] = [];
  isLoading: boolean = false;
  units: Unit[] = [];
  suppliers: Supplier[] = [];

  @ViewChild('errorAlert', { static: false }) errorAlert!: ElementRef;

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    sku: ['', [Validators.required]],
    barcode: [''],
    status: ['', [Validators.required]],
    storageType: ['', [Validators.required]],
    unitId: ['', [Validators.required]],
    supplierId: ['', [Validators.required]],
    brand: [''],
    weightPerItem: [null],
    shelfLifeDays: [null],
  });

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    // Load units and suppliers
    this.loadUnits();
    this.loadSuppliers();

    // Check if creating from a group
    const groupId = this.route.snapshot.queryParamMap.get('groupId');
    const groupName = this.route.snapshot.queryParamMap.get('groupName');
    
    if (groupId && groupName) {
      this.selectedGroup = { 
        id: groupId, 
        name: groupName,
        code: '',
        createdAt: '',
        updatedAt: ''
      };
      this.loadGroupAttributes(groupId);
    }

    if (this.isEditMode && this.productId) {
      this.loadProduct();
    }

    // Load available attributes for standalone products
    if (!this.selectedGroup) {
      this.loadAvailableAttributes();
    }
  }

  ngAfterViewInit() {
    // Component view is initialized
  }

  getFormTitle(): string {
    if (this.isEditMode) return 'Edit Product';
    if (this.selectedGroup) return `Create Product from ${this.selectedGroup.name}`;
    return 'Add New Product';
  }

  loadUnits() {
    this.unitsService.getAll().subscribe({
      next: (units: Unit[]) => {
        this.units = units;
      },
      error: (error: any) => {
        console.error('Error loading units:', error);
        this.errorMessages.push('Failed to load units');
      }
    });
  }

  loadSuppliers() {
    this.suppliersService.getAll().subscribe({
      next: (suppliers: Supplier[]) => {
        this.suppliers = suppliers;
      },
      error: (error: any) => {
        console.error('Error loading suppliers:', error);
        this.errorMessages.push('Failed to load suppliers');
      }
    });
  }

  loadGroupAttributesForEdit(groupAttributes: any[], attributeValues: any[]) {
    // Set group attributes
    this.groupAttributes = groupAttributes;
    
    // Add form controls for each attribute and populate with existing values
    this.groupAttributes.forEach(groupAttr => {
      const validators = groupAttr.required ? [Validators.required] : [];
      const controlName = `attribute_${groupAttr.attributeId}`;
      
      // Find existing value for this attribute
      const existingValue = attributeValues.find(av => av.attributeId === groupAttr.attributeId);
      const initialValue = existingValue ? existingValue.value : '';
      
      this.productForm.addControl(
        controlName,
        this.fb.control(initialValue, validators)
      );
    });
  }

  loadStandaloneProductAttributes(attributeValues: any[]) {
    // Clear existing attributes
    this.productAttributes = [];

    // Convert attribute values to product attributes format
    attributeValues.forEach(av => {
      this.productAttributes.push({
        id: av.id,
        attributeId: av.attributeId,
        value: av.value,
        attribute: av.attribute // Store the full attribute object for display
      });
    });
    
    // Reload available attributes after loading existing ones
    this.loadAvailableAttributes();
  }

  loadProduct() {
    if (this.productId) {
      this.productsService.getById(this.productId).subscribe({
        next: (product: any) => {
          // Patch basic product data
          this.productForm.patchValue(product);
          
          // Handle attribute values based on product type
          if (product.groupId && product.productGroup) {
            // This is a grouped product
            this.selectedGroup = {
              id: product.groupId,
              name: product.productGroup.name,
              code: product.productGroup.code,
              createdAt: product.productGroup.createdAt || '',
              updatedAt: product.productGroup.updatedAt || ''
            };
            
            // Load group attributes and populate with existing values
            this.loadGroupAttributesForEdit(product.productGroup.groupAttributes || [], product.attributeValues || []);
          } else {
            // This is a standalone product
            this.loadStandaloneProductAttributes(product.attributeValues || []);
          }
        },
        error: (error) => {
          console.error('Error loading product:', error);
        }
      });
    }
  }

  saveProduct() {
    if (this.productForm.valid) {
      this.isLoading = true;
      this.clearErrors();
      
      const formData = this.productForm.value;
      
      // Process attribute values for group-based creation
      if (this.selectedGroup) {
        formData.groupId = this.selectedGroup.id;
        
        // Extract attribute values as a Record<string, any> for the backend
        const attributes: Record<string, any> = {};
        this.groupAttributes.forEach(groupAttr => {
          const value = formData[`attribute_${groupAttr.attributeId}`];
          if (value && groupAttr.attribute) {
            // Use attribute ID as key (backend expects this format)
            attributes[groupAttr.attributeId] = value;
          }
          // Remove the attribute field from form data
          delete formData[`attribute_${groupAttr.attributeId}`];
        });
        
        formData.attributes = attributes;
      } else {
        // Process product attributes for individual products
        if (this.productAttributes.length > 0) {
          const attributes: Record<string, any> = {};
          this.productAttributes.forEach(attr => {
            // Use attribute ID as expected by backend
            attributes[attr.attributeId] = attr.value;
          });
          formData.attributes = attributes;
        }
      }

      if (this.isEditMode && this.productId) {
        this.productsService.update(this.productId, formData).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.isLoading = false;
            this.handleError(error);
          }
        });
      } else {
        this.productsService.create(formData).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.isLoading = false;
            this.handleError(error);
          }
        });
      }
    }
  }

  removeProductAttribute(index: number) {
    this.productAttributes.splice(index, 1);
    
    // Reload available attributes to include the removed one
    this.loadAvailableAttributes();
  }

  // Method to manually trigger change detection for debugging
  onAttributeValueChange(attr: any, newValue: any) {
    attr.value = newValue;
    
    // Force change detection by updating the array reference
    this.productAttributes = [...this.productAttributes];
  }

  // Method to handle input events with proper typing
  onInputChange(attr: any, event: Event) {
    const target = event.target as HTMLInputElement;
    this.onAttributeValueChange(attr, target.value);
  }

  // Method to handle select events with proper typing
  onSelectChange(attr: any, event: Event) {
    const target = event.target as HTMLSelectElement;
    this.onAttributeValueChange(attr, target.value);
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  handleError(error: any) {
    console.error('Error:', error);
    
    // Clear existing errors
    this.errorMessages = [];
    
    // Handle different types of errors
    if (error.error) {
      // Backend error response
      if (error.error.errors && Array.isArray(error.error.errors)) {
        // Multiple validation errors (array) - check this first
        this.errorMessages.push(...error.error.errors);
      } else if (error.error.errors) {
        // Multiple validation errors (object with field names)
        Object.keys(error.error.errors).forEach(field => {
          const fieldErrors = error.error.errors[field];
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach(fieldError => {
              this.errorMessages.push(`${field}: ${fieldError}`);
            });
          } else {
            this.errorMessages.push(`${field}: ${fieldErrors}`);
          }
        });
      } else if (error.error.message) {
        // Single error message
        this.errorMessages.push(error.error.message);
      } else if (error.error.error) {
        // Generic error field
        this.errorMessages.push(error.error.error);
      } else {
        // Fallback for other error structures
        this.errorMessages.push('An error occurred while processing your request.');
      }
    } else if (error.message) {
      // Generic error message
      this.errorMessages.push(error.message);
    } else if (error.status === 0) {
      // Network error
      this.errorMessages.push('Unable to connect to the server. Please check your internet connection and try again.');
    } else if (error.status === 400) {
      // Bad request
      this.errorMessages.push('Invalid data provided. Please check your input and try again.');
    } else if (error.status === 401) {
      // Unauthorized
      this.errorMessages.push('You are not authorized to perform this action. Please log in again.');
    } else if (error.status === 403) {
      // Forbidden
      this.errorMessages.push('You do not have permission to perform this action.');
    } else if (error.status === 404) {
      // Not found
      this.errorMessages.push('The requested resource was not found.');
    } else if (error.status >= 500) {
      // Server error
      this.errorMessages.push('A server error occurred. Please try again later.');
    } else {
      // Unknown error
      this.errorMessages.push('An unexpected error occurred. Please try again.');
    }
    
    // If no errors were added, add a generic one
    if (this.errorMessages.length === 0) {
      this.errorMessages.push('An unexpected error occurred. Please try again.');
    }
    
    // Scroll to error section if errors are displayed
    if (this.errorMessages.length > 0) {
      setTimeout(() => {
        if (this.errorAlert) {
          this.errorAlert.nativeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  }

  clearErrors() {
    this.errorMessages = [];
  }

  loadGroupAttributes(groupId: string) {
    this.productGroupsService.getGroupAttributes(groupId).subscribe({
      next: (groupAttributes) => {
        this.groupAttributes = groupAttributes;
        
        // Add form controls for each attribute
        this.groupAttributes.forEach(groupAttr => {
          const validators = groupAttr.required ? [Validators.required] : [];
          const controlName = `attribute_${groupAttr.attributeId}`;
          
          this.productForm.addControl(
            controlName,
            this.fb.control('', validators)
          );
        });
      },
      error: (error) => {
        console.error('Error loading group attributes:', error);
        this.groupAttributes = [];
      }
    });
  }

  loadAvailableAttributes() {
    this.attributesService.getAll().subscribe({
      next: (attributes) => {
        // Filter out attributes that are already assigned to this product
        const assignedAttributeIds = this.productAttributes.map(attr => attr.attributeId);
        this.availableAttributes = attributes.filter(attr => !assignedAttributeIds.includes(attr.id));
      },
      error: (error) => {
        console.error('Error loading available attributes:', error);
        this.availableAttributes = [];
      }
    });
  }

  onAttributeSelectionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedAttributeId = target.value;
    this.newAttributeValue = ''; // Reset value when attribute changes
  }

  onNewAttributeValueChange(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.newAttributeValue = target.value;
  }

  getOptionValue(option: any): string {
    return option.option;
  }

  // Debug method to check if value matches option
  isValueSelected(attr: any, option: any): boolean {
    const optionValue = this.getOptionValue(option);
    const isSelected = attr.value === optionValue;
    return isSelected;
  }

  getSelectedAttribute(): Attribute | null {
    return this.availableAttributes.find(attr => attr.id === this.selectedAttributeId) || null;
  }

  addProductAttribute() {
    const selectedAttribute = this.getSelectedAttribute();
    if (selectedAttribute) {
      // Add the new attribute to the product attributes array with empty value
      this.productAttributes.push({
        id: null, // Will be assigned by backend
        attributeId: selectedAttribute.id,
        value: '', // Empty value to be set by user
        attribute: selectedAttribute
      });

      // Reset the form
      this.selectedAttributeId = '';

      // Reload available attributes to remove the one we just added
      this.loadAvailableAttributes();
    }
  }
}
