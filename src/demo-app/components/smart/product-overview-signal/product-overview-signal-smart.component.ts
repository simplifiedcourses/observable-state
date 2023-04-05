import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarUiComponent } from '../../ui/sidebar/sidebar.ui-component';
import { ProductUiComponent } from '../../ui/product/product.ui-component';
import { BreadcrumbUiComponent } from '../../ui/breadcrumb/breadcrumb.ui-component';
import { PagerUiComponent } from '../../ui/pager/pager.ui-component';
import { FacadeService } from '../../../services/facade.service';
import { BreadcrumbItem } from '../../../types/breadcrumb-item.type';
import { interval, map } from 'rxjs';
import { Category } from '../../../types/category.type';
import { Product } from '../../../types/product.type';
import { SignalState } from '../../../../state/signal-state';

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

type ViewModel =
  Pick<ProductOverviewState, 'categories' | 'query' | 'products' | 'itemsPerPage' | 'pageIndex' | 'time'>
  & {
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
  templateUrl: './product-overview-signal.smart-component.html',
  styleUrls: ['./product-overview-signal.smart-component.scss'],
})
export class ProductOverviewSignalSmartComponent extends SignalState<ProductOverviewState> {
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

  private readonly filteredProducts = computed(() => {
    const products = this.select('products');
    const query = this.select('query')
    return products().filter(p => p.name.toLowerCase().indexOf(query().toLowerCase()) > -1)
  })

  private readonly pagedProducts = computed(() => {
    const pageIndex = this.select('pageIndex');
    const itemsPerPage = this.select('itemsPerPage');
    const filteredProducts = this.select('filteredProducts');
    const offsetStart = (pageIndex()) * itemsPerPage();
    const offsetEnd = (pageIndex() + 1) * itemsPerPage();
    return filteredProducts().slice(offsetStart, offsetEnd);
  })
  public readonly vm = computed(() => {
    const { filteredProducts, query, categories, itemsPerPage, pageIndex, pagedProducts, time } = this.state();
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

    this.connectObservables({
      products: this.facadeService.getProducts(),
      categories: this.facadeService.getCategories(),
      time: interval(1000).pipe(map(() => new Date().getTime()))
    });
    this.connectSignals({
      filteredProducts: this.filteredProducts,
      pagedProducts: this.pagedProducts
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
