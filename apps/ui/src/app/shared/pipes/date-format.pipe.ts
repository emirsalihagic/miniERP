import { Pipe, PipeTransform, inject } from '@angular/core';
import { UserPreferencesService } from '../../core/services/user-preferences.service';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  private userPreferencesService = inject(UserPreferencesService);

  transform(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    return this.userPreferencesService.formatDate(value);
  }
}
