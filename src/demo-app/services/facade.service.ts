import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ShoppingCartObservableState } from './shopping-cart-observable-state';
import { Category } from '../types/category.type';
import { ProductService } from './product.service';
import { Product } from '../types/product.type';
import { CategoryService } from './category.service';
import { ShoppingCartEntry } from '../types/shopping-cart-entry';

@Injectable({
  providedIn: 'root',
})
export class FacadeService {
  public readonly shoppingCartObservableState = inject(ShoppingCartObservableState);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  public getProducts(): Observable<Product[]> {
    return this.productService.getProducts();
  }

  public getProductByd(id: number): Observable<Product> {
    return this.productService.getProductById(id);
  }

  public getCategories(): Observable<Category[]> {
    return this.categoryService.getCategories();
  }

  public getCategoryByd(id: number): Observable<Category> {
    return this.categoryService.getCategoryById(id);
  }

  public addToShoppingCart(entry: ShoppingCartEntry): void {
    this.shoppingCartObservableState.addToCart(entry)
  }

  public updateAmountInCart(id: number, amount: number): void {
    this.shoppingCartObservableState.updateAmount(id, amount)
  }
}
