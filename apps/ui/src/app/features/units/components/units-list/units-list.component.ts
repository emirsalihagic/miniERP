import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UnitsService, Unit, CreateUnitDto } from '../../services/units.service';

@Component({
  selector: 'app-units-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="units-container">
      <div class="header">
        <h2>Units Management</h2>
        <button 
          class="btn btn-primary" 
          (click)="openCreateModal()"
        >
          Add Unit
        </button>
      </div>

      <div class="units-grid">
        <div 
          *ngFor="let unit of units" 
          class="unit-card"
        >
          <div class="unit-header">
            <h3>{{ unit.name }}</h3>
            <div class="unit-actions">
              <button 
                class="btn btn-sm btn-secondary"
                (click)="openEditModal(unit)"
              >
                Edit
              </button>
              <button 
                class="btn btn-sm btn-danger"
                (click)="deleteUnit(unit.id)"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div class="unit-details">
            <p><strong>Code:</strong> {{ unit.code }}</p>
            <p><strong>Group:</strong> 
              <span class="group-tag" [class]="'group-' + unit.group.toLowerCase()">
                {{ unit.group }}
              </span>
            </p>
            <p><strong>Base Unit:</strong> 
              <span [class]="unit.isBase ? 'text-success' : 'text-muted'">
                {{ unit.isBase ? 'Yes' : 'No' }}
              </span>
            </p>
            <p><strong>Conversion Factor:</strong> {{ unit.toBaseFactor | number:'1.0-6' }}</p>
          </div>
        </div>
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
            <h3>{{ isEditMode ? 'Edit Unit' : 'Add Unit' }}</h3>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          
          <form 
            [formGroup]="unitForm" 
            (ngSubmit)="saveUnit()"
            class="modal-body"
          >
            <div class="form-group">
              <label for="code">Code *</label>
              <input 
                id="code"
                type="text" 
                formControlName="code" 
                class="form-control"
                placeholder="e.g., kg, l, m, pc"
              >
              <div 
                *ngIf="unitForm.get('code')?.invalid && unitForm.get('code')?.touched"
                class="error-message"
              >
                Code is required
              </div>
            </div>

            <div class="form-group">
              <label for="name">Name *</label>
              <input 
                id="name"
                type="text" 
                formControlName="name" 
                class="form-control"
                placeholder="e.g., Kilogram, Liter, Meter, Piece"
              >
              <div 
                *ngIf="unitForm.get('name')?.invalid && unitForm.get('name')?.touched"
                class="error-message"
              >
                Name is required
              </div>
            </div>

            <div class="form-group">
              <label for="group">Group *</label>
              <select 
                id="group"
                formControlName="group" 
                class="form-control"
              >
                <option value="">Select unit group</option>
                <option value="WEIGHT">Weight</option>
                <option value="VOLUME">Volume</option>
                <option value="LENGTH">Length</option>
                <option value="COUNT">Count</option>
              </select>
              <div 
                *ngIf="unitForm.get('group')?.invalid && unitForm.get('group')?.touched"
                class="error-message"
              >
                Group is required
              </div>
            </div>

            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  formControlName="isBase"
                >
                This is a base unit for the group
              </label>
            </div>

            <div class="form-group">
              <label for="toBaseFactor">Conversion Factor *</label>
              <input 
                id="toBaseFactor"
                type="number" 
                formControlName="toBaseFactor" 
                class="form-control"
                step="0.000001"
                min="0.000001"
                placeholder="1.0"
              >
              <div 
                *ngIf="unitForm.get('toBaseFactor')?.invalid && unitForm.get('toBaseFactor')?.touched"
                class="error-message"
              >
                Conversion factor must be greater than 0
              </div>
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
                [disabled]="!unitForm.valid"
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
    .units-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .units-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .unit-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .unit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .unit-actions {
      display: flex;
      gap: 8px;
    }

    .unit-details p {
      margin: 8px 0;
    }

    .group-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .group-weight { background: #e3f2fd; color: #1976d2; }
    .group-volume { background: #e8f5e8; color: #388e3c; }
    .group-length { background: #fff3e0; color: #f57c00; }
    .group-count { background: #f3e5f5; color: #7b1fa2; }

    .text-success { color: #28a745; }
    .text-muted { color: #6c757d; }

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

  `]
})
export class UnitsListComponent implements OnInit {
  private unitsService = inject(UnitsService);
  private fb = inject(FormBuilder);

  units: Unit[] = [];
  showModal = false;
  isEditMode = false;
  editingUnit: Unit | null = null;

  unitForm: FormGroup = this.fb.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    group: ['', [Validators.required]],
    isBase: [false],
    toBaseFactor: [1, [Validators.required, Validators.min(0.000001)]],
  });

  ngOnInit() {
    this.loadUnits();
  }

  loadUnits() {
    this.unitsService.getAll().subscribe({
      next: (units) => {
        this.units = units;
      },
      error: (error) => {
        console.error('Error loading units:', error);
      }
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingUnit = null;
    this.unitForm.reset({
      isBase: false,
      toBaseFactor: 1,
    });
    this.showModal = true;
  }

  openEditModal(unit: Unit) {
    this.isEditMode = true;
    this.editingUnit = unit;
    this.unitForm.patchValue(unit);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingUnit = null;
    this.unitForm.reset();
  }

  saveUnit() {
    if (this.unitForm.valid) {
      const formData = this.unitForm.value;
      
      if (this.isEditMode && this.editingUnit) {
        this.unitsService.update(this.editingUnit.id, formData).subscribe({
          next: () => {
            this.closeModal();
            this.loadUnits();
          },
          error: (error) => {
            console.error('Error updating unit:', error);
          }
        });
      } else {
        this.unitsService.create(formData).subscribe({
          next: () => {
            this.closeModal();
            this.loadUnits();
          },
          error: (error) => {
            console.error('Error creating unit:', error);
          }
        });
      }
    }
  }

  deleteUnit(id: string) {
    if (confirm('Are you sure you want to delete this unit?')) {
      this.unitsService.delete(id).subscribe({
        next: () => {
          this.loadUnits();
        },
        error: (error) => {
          console.error('Error deleting unit:', error);
        }
      });
    }
  }
}
