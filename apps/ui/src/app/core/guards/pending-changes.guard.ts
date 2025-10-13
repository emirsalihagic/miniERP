import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate(): boolean | Observable<boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class PendingChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  constructor() {}

  canDeactivate(component: CanComponentDeactivate): boolean | Observable<boolean> {
    console.log('PendingChangesGuard: canDeactivate called', component);
    
    if (!component.canDeactivate) {
      console.log('PendingChangesGuard: component has no canDeactivate method');
      return true;
    }

    const canDeactivate = component.canDeactivate();
    console.log('PendingChangesGuard: component.canDeactivate() returned:', canDeactivate);
    
    if (typeof canDeactivate === 'boolean') {
      if (!canDeactivate) {
        console.log('PendingChangesGuard: showing unsaved changes modal');
        // Return Observable that handles the confirmation dialog
        return new Observable(observer => {
          const confirmed = confirm('You have unsaved changes. Are you sure you want to leave this page?');
          console.log('PendingChangesGuard: user confirmed:', confirmed);
          observer.next(confirmed);
          observer.complete();
        });
      }
      console.log('PendingChangesGuard: allowing navigation');
      return true;
    }

    // Handle Observable<boolean>
    return new Observable(observer => {
      canDeactivate.subscribe({
        next: (result: boolean) => {
          if (!result) {
            const confirmed = confirm('You have unsaved changes. Are you sure you want to leave this page?');
            console.log('PendingChangesGuard: user confirmed:', confirmed);
            observer.next(confirmed);
            observer.complete();
          } else {
            observer.next(true);
            observer.complete();
          }
        },
        error: (error) => observer.error(error),
        complete: () => observer.complete()
      });
    });
  }
}
