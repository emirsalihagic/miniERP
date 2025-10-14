import { Pipe, PipeTransform, inject } from '@angular/core';
import { UserPreferencesService } from '../../core/services/user-preferences.service';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  private userPreferencesService = inject(UserPreferencesService);

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) {
      return '';
    }

    return this.userPreferencesService.formatCurrency(numericValue);
  }
}
