import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CanComponentDeactivate } from '../guards/pending-changes.guard';

/**
 * Base form component that provides unsaved changes protection
 * for all create/edit forms in the application.
 * 
 * Extend this component and implement the required abstract methods.
 */
@Component({
  template: ''
})
export abstract class BaseFormComponent implements CanComponentDeactivate {
  /**
   * The form group that should be monitored for changes
   */
  abstract get form(): FormGroup;

  /**
   * Whether the form is currently in a loading state
   */
  abstract get loading(): boolean;

  /**
   * Check if the component can be deactivated (navigated away from)
   * without losing unsaved changes.
   * 
   * @returns true if navigation is allowed, false if user should be warned
   */
  canDeactivate(): boolean {
    // Only block if form is dirty AND we're not in the middle of a successful operation
    // This prevents blocking when form is marked dirty due to initialization or validation updates
    const hasUnsavedChanges = this.form.dirty && !this.loading;
    
    console.log(`${this.constructor.name}: canDeactivate called`, {
      formDirty: this.form.dirty,
      loading: this.loading,
      hasUnsavedChanges: hasUnsavedChanges
    });
    
    return !hasUnsavedChanges;
  }

  /**
   * Mark the form as pristine after successful operations
   * Call this method after successful create/update operations
   */
  protected markFormAsPristine(): void {
    this.form.markAsPristine();
  }

  /**
   * Mark the form as pristine after loading data
   * Call this method after populating the form with existing data
   */
  protected markFormAsPristineAfterLoad(): void {
    this.form.markAsPristine();
  }
}
