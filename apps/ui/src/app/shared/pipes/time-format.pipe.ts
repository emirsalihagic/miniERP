import { Pipe, PipeTransform, inject } from '@angular/core';
import { UserPreferencesService } from '../../core/services/user-preferences.service';

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {
  private userPreferencesService = inject(UserPreferencesService);

  transform(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    return this.userPreferencesService.formatTime(value);
  }
}
