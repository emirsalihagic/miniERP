import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySymbol',
  standalone: true
})
export class CurrencySymbolPipe implements PipeTransform {
  transform(currency: string): string {
    switch (currency) {
      case 'BAM': return 'KM';
      case 'EUR': return '€';
      case 'USD': return '$';
      default: return '$';
    }
  }
}

@Pipe({
  name: 'formatCurrency',
  standalone: true
})
export class FormatCurrencyPipe implements PipeTransform {
  transform(value: number | string, currency: string = 'USD'): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';
    
    const symbol = new CurrencySymbolPipe().transform(currency);
    
    // Different currencies have different symbol placement conventions
    switch (currency) {
      case 'USD':
        return `$${numValue.toLocaleString()}`;
      case 'EUR':
        return `${numValue.toLocaleString()}€`;
      case 'BAM':
        return `${numValue.toLocaleString()} KM`;
      default:
        return `$${numValue.toLocaleString()}`;
    }
  }
}
