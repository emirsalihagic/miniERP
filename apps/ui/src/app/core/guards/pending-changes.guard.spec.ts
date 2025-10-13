import { TestBed } from '@angular/core/testing';
import { PendingChangesGuard } from './pending-changes.guard';
import { CanComponentDeactivate } from './pending-changes.guard';
import { NzModalService } from 'ng-zorro-antd/modal';
import { of } from 'rxjs';

describe('PendingChangesGuard', () => {
  let guard: PendingChangesGuard;
  let mockModalService: jasmine.SpyObj<NzModalService>;
  let mockComponent: jasmine.SpyObj<CanComponentDeactivate>;

  beforeEach(() => {
    const modalSpy = jasmine.createSpyObj('NzModalService', ['confirm']);
    
    TestBed.configureTestingModule({
      providers: [
        PendingChangesGuard,
        { provide: NzModalService, useValue: modalSpy }
      ]
    });

    guard = TestBed.inject(PendingChangesGuard);
    mockModalService = TestBed.inject(NzModalService) as jasmine.SpyObj<NzModalService>;
    mockComponent = jasmine.createSpyObj('CanComponentDeactivate', ['canDeactivate']);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canDeactivate', () => {
    it('should return true when component has no canDeactivate method', () => {
      const componentWithoutMethod = {} as CanComponentDeactivate;
      
      const result = guard.canDeactivate(componentWithoutMethod);
      
      expect(result).toBe(true);
    });

    it('should return true when component canDeactivate returns true', () => {
      mockComponent.canDeactivate.and.returnValue(true);
      
      const result = guard.canDeactivate(mockComponent);
      
      expect(result).toBe(true);
      expect(mockModalService.confirm).not.toHaveBeenCalled();
    });

    it('should show modal when component canDeactivate returns false', () => {
      mockComponent.canDeactivate.and.returnValue(false);
      mockModalService.confirm.and.returnValue({
        afterClose: of(true)
      } as any);
      
      guard.canDeactivate(mockComponent);
      
      expect(mockModalService.confirm).toHaveBeenCalledWith({
        nzTitle: 'Unsaved Changes',
        nzContent: 'You have unsaved changes. Are you sure you want to leave this page?',
        nzOkText: 'Leave',
        nzOkType: 'primary',
        nzOkDanger: true,
        nzCancelText: 'Stay',
        nzOnOk: jasmine.any(Function),
        nzOnCancel: jasmine.any(Function)
      });
    });

    it('should handle Observable<boolean> returning true', () => {
      mockComponent.canDeactivate.and.returnValue(of(true));
      
      guard.canDeactivate(mockComponent).subscribe(result => {
        expect(result).toBe(true);
      });
      
      expect(mockModalService.confirm).not.toHaveBeenCalled();
    });

    it('should handle Observable<boolean> returning false', () => {
      mockComponent.canDeactivate.and.returnValue(of(false));
      mockModalService.confirm.and.returnValue({
        afterClose: of(true)
      } as any);
      
      guard.canDeactivate(mockComponent).subscribe(result => {
        expect(result).toBe(true);
      });
      
      expect(mockModalService.confirm).toHaveBeenCalled();
    });

    it('should return false when user cancels in modal', () => {
      mockComponent.canDeactivate.and.returnValue(false);
      mockModalService.confirm.and.returnValue({
        afterClose: of(false)
      } as any);
      
      guard.canDeactivate(mockComponent).subscribe(result => {
        expect(result).toBe(false);
      });
    });
  });
});
