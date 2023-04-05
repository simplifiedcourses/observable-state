import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, map, Observable } from 'rxjs';
import { Category } from '../../../types/category.type';
import { PagerUiComponent } from '../../ui/pager/pager.ui-component';
import { Product } from '../../../types/product.type';
import { ObservableState } from '../../../../state/observable-state';
import { FacadeService } from '../../../services/facade.service';
import { BreadcrumbItem } from '../../../types/breadcrumb-item.type';
import { SidebarUiComponent } from '../../ui/sidebar/sidebar.ui-component';
import { BreadcrumbUiComponent } from '../../ui/breadcrumb/breadcrumb.ui-component';
import { ProductUiComponent } from '../../ui/product/product.ui-component';

type ProductOverviewState = {
  pageIndex: number;
  query: string;
  itemsPerPage: number;
  categories: Category[];
  products: Product[];
  filteredProducts: Product[];
  pagedProducts: Product[];
  time: number;
}

type ViewModel = Pick<ProductOverviewState, 'categories'|'query'|'products'|'itemsPerPage'|'pageIndex'|'time'> & {
  total: number;
}

@Component({
  selector: 'sh-product-overview',
  standalone: true,
  imports: [
    CommonModule,
    SidebarUiComponent,
    ProductUiComponent,
    BreadcrumbUiComponent,
    PagerUiComponent
  ],
  templateUrl: './product-overview.smart-component.html',
  styleUrls: ['./product-overview.smart-component.scss'],
})
export class ProductOverviewSmartComponent extends ObservableState<ProductOverviewState> {
  private readonly facadeService = inject(FacadeService);
  public readonly breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Home',
      route: [''],
    },
    {
      label: 'Products',
      route: ['/products'],
    },
  ];

  private readonly filteredProducts$ = this.onlySelectWhen(['products', 'query']).pipe(
    map(({ products, query }) => {
      return products.filter(p => p.name.toLowerCase().indexOf(query.toLowerCase()) > -1)
    })
  );

  private readonly pagedProducts$ = this.onlySelectWhen(['filteredProducts', 'pageIndex', 'itemsPerPage']).pipe(
    map(({ filteredProducts, pageIndex, itemsPerPage }) => {
      const offsetStart = (pageIndex) * itemsPerPage;
      const offsetEnd = (pageIndex + 1) * itemsPerPage;
      return filteredProducts.slice(offsetStart, offsetEnd);
    })
  );
  public readonly vm$: Observable<ViewModel> = this.onlySelectWhen([
    'categories',
    'pagedProducts',
    'filteredProducts',
    'pageIndex',
    'itemsPerPage',
    'query',
    'time'
  ]).pipe(
    map(({ categories, filteredProducts, pagedProducts, pageIndex, itemsPerPage, query, time }) => {
      return {
        total: filteredProducts.length,
        query: query,
        categories,
        itemsPerPage,
        pageIndex,
        products: pagedProducts,
        time
      }
    })
  )

  constructor() {
    super();
    this.initialize({
      pageIndex: 0,
      itemsPerPage: 5,
      query: '',
      categories: [],
      products: [],
      filteredProducts: [],
      pagedProducts: [],
      time: new Date().getTime()
    });

    this.connect({
      products: this.facadeService.getProducts(),
      categories: this.facadeService.getCategories(),
      filteredProducts: this.filteredProducts$,
      pagedProducts: this.pagedProducts$,
      time: interval(1000).pipe(map(() => new Date().getTime()))
    })
  }



  public setQuery(e: Event): void {
    this.patch({ pageIndex: 0, query: (e.target as HTMLInputElement).value })
  }

  public pageIndexChange(pageIndex: number): void {
    this.patch({ pageIndex });
  }

  public itemsPerPageChange(itemsPerPage: number): void {
    this.patch({ pageIndex: 0, itemsPerPage })
  }
}
