import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { ShopProductsService, Product, ShopProductFilters } from '../../services/shop-products.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-shop-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzGridModule,
    NzPaginationModule,
    NzSpinModule,
    NzIconModule,
    NzTagModule,
    NzBadgeModule,
    NzEmptyModule,
    NzInputNumberModule
  ],
  templateUrl: './shop-catalog.component.html',
  styleUrl: './shop-catalog.component.less'
})
export class ShopCatalogComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  total = 0;
  page = 1;
  pageSize = 12;
  
  // Filters
  searchTerm = '';
  selectedBrand = '';
  selectedGroup = '';
  
  // Cart
  cartItemCount = 0;
  productQuantities: { [productId: string]: number } = {};
  
  // Brands and groups for filters
  brands: string[] = [];
  groups: any[] = [];

  // Price resolution
  productPrices: { [productId: string]: number } = {};
  priceLoading: { [productId: string]: boolean } = {};

  constructor(
    private shopProductsService: ShopProductsService,
    private cartService: CartService,
    private authService: AuthService,
    private message: NzMessageService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.subscribeToCart();
  }

  subscribeToCart(): void {
    this.cartService.itemCount$.subscribe(count => {
      this.cartItemCount = count;
    });
  }

  loadProducts(): void {
    this.loading = true;
    
    const filters: ShopProductFilters = {
      page: this.page,
      limit: this.pageSize,
      search: this.searchTerm || undefined,
      brand: this.selectedBrand || undefined,
      groupId: this.selectedGroup || undefined
    };

    this.shopProductsService.getShopProducts(filters).subscribe({
      next: (response) => {
        this.products = response.data;
        this.total = response.meta.total;
        this.extractBrandsAndGroups();
        this.initializeProductQuantities();
        this.resolveProductPrices();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.message.error('Failed to load products');
        this.loading = false;
      }
    });
  }

  extractBrandsAndGroups(): void {
    const brandSet = new Set<string>();
    const groupSet = new Set<any>();
    
    this.products.forEach(product => {
      if (product.brand) {
        brandSet.add(product.brand);
      }
      if (product.productGroup) {
        groupSet.add(product.productGroup);
      }
    });
    
    this.brands = Array.from(brandSet).sort();
    this.groups = Array.from(groupSet);
  }

  initializeProductQuantities(): void {
    // Initialize quantity inputs for all products
    this.products.forEach(product => {
      if (!this.productQuantities[product.id]) {
        this.productQuantities[product.id] = 1; // Default quantity
      }
    });
  }

  resolveProductPrices(): void {
    // Resolve prices for all products
    this.products.forEach(product => {
      this.resolvePrice(product.id);
    });
  }

  resolvePrice(productId: string): void {
    this.priceLoading[productId] = true;
    
    const currentUser = this.authService.getCurrentUser();
    const clientId = currentUser?.clientId;
    
    const requestBody = {
      productId: productId,
      clientId: clientId
    };

    this.http.post(`${environment.apiUrl}/pricing/resolve`, requestBody).subscribe({
      next: (response: any) => {
        // Convert Decimal to number for display
        this.productPrices[productId] = parseFloat(response.price.toString());
        this.priceLoading[productId] = false;
      },
      error: (error) => {
        console.error(`Error resolving price for product ${productId}:`, error);
        // Fallback to a default price if resolution fails
        this.productPrices[productId] = 0;
        this.priceLoading[productId] = false;
      }
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadProducts();
  }

  addToCart(product: Product): void {
    const quantity = this.productQuantities[product.id] || 1;
    
    console.log('🔍 [ShopCatalog] Adding to cart:', {
      productId: product.id,
      productName: product.name,
      selectedQuantity: quantity,
      productQuantities: this.productQuantities
    });
    
    if (quantity <= 0) {
      this.message.warning('Please enter a valid quantity');
      return;
    }

    this.cartService.addItem(product.id, quantity).subscribe({
      next: () => {
        this.message.success(`Added ${quantity} x ${product.name} to cart`);
        // Reset quantity input after adding to cart
        this.productQuantities[product.id] = 1; // Reset to default instead of undefined
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.message.error('Failed to add item to cart');
      }
    });
  }

  getProductImage(product: Product): string {
    // Placeholder image - in real app, this would come from product data
    return 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.name);
  }

  getProductPrice(product: Product): number {
    // Return resolved price or 0 if not yet loaded
    return this.productPrices[product.id] || 0;
  }

  isPriceLoading(productId: string): boolean {
    return this.priceLoading[productId] || false;
  }

  formatPrice(price: number): string {
    if (price === 0) {
      return 'Price loading...';
    }
    
    // Convert USD to EUR (approximate rate: 1 USD = 0.85 EUR)
    // In a real application, this would use a live exchange rate API
    const eurPrice = price * 0.85;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(eurPrice);
  }

  getAttributeValue(product: Product, attributeName: string): string {
    if (!product.attributes) return '';
    return product.attributes[attributeName] || '';
  }

  hasAttributes(product: Product): boolean {
    return !!(product.attributes && Object.keys(product.attributes).length > 0);
  }
}
