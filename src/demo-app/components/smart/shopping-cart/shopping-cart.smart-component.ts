import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Product } from '../../../types/product.type';
import { ObservableState } from '../../../../state/observable-state';
import { FormsModule } from '@angular/forms';
import { FacadeService } from '../../../services/facade.service';
import { ShoppingCartEntry } from '../../../types/shopping-cart-entry';
import { ButtonUiComponent } from '../../ui/button/button.ui-component';
import { BreadcrumbItem } from '../../../types/breadcrumb-item.type';
import { BreadcrumbUiComponent } from '../../ui/breadcrumb/breadcrumb.ui-component';

type ShoppingCartSmartComponentState = {
  entries: ShoppingCartEntry[];
  products: Product[];
}

type ViewModel = {
  shoppingCartEntriesWithProductInfo: (ShoppingCartEntry & { price: number, name: string })[];
  amount: number;
  totalPrice: number;
}

@Component({
  selector: 'sh-shopping-cart',
  standalone: true,
  imports: [
    CommonModule,
    ButtonUiComponent,
    BreadcrumbUiComponent,
    RouterModule,
    FormsModule
  ],
  templateUrl: './shopping-cart.smart-component.html',
  styleUrls: ['./shopping-cart.smart-component.scss'],
})
export class ShoppingCartSmartComponent extends ObservableState<ShoppingCartSmartComponentState> {
  private readonly facade = inject(FacadeService);
  private readonly shoppingCartObservableState = this.facade.shoppingCartObservableState;

  constructor() {
    super();
    this.initialize({
      entries: [],
      products: [],
    });

    this.connect({
      ...this.shoppingCartObservableState.pick(['entries']),
      products: this.facade.getProducts()
    })
  }

  public readonly vm$: Observable<ViewModel> = this.onlySelectWhen(['entries', 'products']).pipe(
    map(({ entries, products }) => {
      if(products.length === 0){
        return {
          totalPrice: 0,
          amount: 0,
          shoppingCartEntriesWithProductInfo: []
        }
      }
      const shoppingCartEntriesWithProductInfo = entries.map(entry => {
        const product: Product | undefined = products.find(p => p.id === entry.productId)
        if (!product) {
          throw new Error('product not found')
        }
        return { ...entry, price: product.price, name: product.name }
      })
      return {
        shoppingCartEntriesWithProductInfo,
        totalPrice: shoppingCartEntriesWithProductInfo
          .reduce((totalPrice: number, item) => totalPrice + (item?.amount * item.price), 0),
        amount: entries
          .reduce((amount: number, item) => amount + item.amount, 0)
      }
    })
  );

  public readonly breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Home',
      route: [''],
    },
    {
      label: 'Shopping-cart',
      route: ['/payment', 'shopping-cart'],
    },
  ];

  public updateAmount(event: Event, productId: number): void {
    this.facade.updateAmountInCart(productId, Number((event.target as HTMLInputElement).value));
  }
}
