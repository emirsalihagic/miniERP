import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzResultModule,
    NzButtonModule
  ],
  template: `
    <div class="not-found-container">
      <nz-result
        nzStatus="404"
        nzTitle="404"
        nzSubTitle="Sorry, the page you visited does not exist."
        [nzExtra]="extraTemplate"
      >
        <ng-template #extraTemplate>
          <button type="button" class="btn btn-primary" (click)="goHome()">
            Back Home
          </button>
          <button type="button" class="btn btn-secondary" (click)="goBack()" style="margin-left: 8px;">
            Go Back
          </button>
        </ng-template>
      </nz-result>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 24px;
    }
  `]
})
export class NotFoundComponent {
  constructor(private navigationService: NavigationService) {}

  goHome(): void {
    this.navigationService.navigateBackOr(['/dashboard']);
  }

  goBack(): void {
    this.navigationService.navigateBackOr(['/dashboard']);
  }
}
