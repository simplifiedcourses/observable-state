import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, filter, map, merge, Observable, switchMap } from 'rxjs';
import { SidebarUiComponent } from '../../ui/sidebar/sidebar.ui-component';
import { ButtonUiComponent } from '../../ui/button/button.ui-component';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbItem } from '../../../types/breadcrumb-item.type';
import { BreadcrumbUiComponent } from '../../ui/breadcrumb/breadcrumb.ui-component';
import { ProductUiComponent } from '../../ui/product/product.ui-component';
import { FacadeService } from '../../../services/facade.service';

@Component({
  selector: 'sh-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    SidebarUiComponent,
    ProductUiComponent,
    BreadcrumbUiComponent,
    ButtonUiComponent,
  ],
  templateUrl: './product-detail.smart-component.html',
  styleUrls: ['./product-detail.smart-component.scss'],
})
export class ProductDetailSmartComponent {
  private readonly facadeService = inject(FacadeService);
  public readonly categories$ = this.facadeService.getCategories();
  private readonly activatedRoute = inject(ActivatedRoute);
  public readonly product$ = this.activatedRoute.params.pipe(
    switchMap((params) =>
      this.facadeService.getProductByd(Number(params['productId']))
    )
  );
  private readonly defaultBreadcrumb = [
    {
      label: 'Home',
      route: [''],
    },
    {
      label: 'Products',
      route: ['/products'],
    },
  ];
  private readonly categoryId$ = this.activatedRoute.params.pipe(
    map((params) => params['categoryId']),
    filter((v) => !!v),
    map((v) => Number(v))
  );
  public readonly category$ = this.categoryId$.pipe(
    switchMap((id) => this.facadeService.getCategoryByd(id))
  );
  private readonly breadcrumbItemsCategory$: Observable<BreadcrumbItem[]> =
    combineLatest([this.category$, this.product$]).pipe(
      map(([category, product]) => {
        return [
          ...this.defaultBreadcrumb,
          {
            label: category.name,
            route: ['/categories', category.id.toString()],
          },
          {
            label: product.name,
            route: [
              '/categories',
              category.id.toString(),
              product.id.toString(),
            ],
          },
        ];
      })
    );

  private readonly breadcrumbItemsNoCategory$: Observable<BreadcrumbItem[]> =
    this.product$.pipe(
      map((product) => {
        return [
          ...this.defaultBreadcrumb,
          {
            label: product.name,
            route: ['/categories', product.id.toString()],
          },
        ];
      })
    );

  public readonly breadcrumbItems$ = merge(
    this.breadcrumbItemsNoCategory$,
    this.breadcrumbItemsCategory$
  );

  public addToShoppingCart(): void {
    this.facadeService.addToShoppingCart({productId: Number(this.activatedRoute.snapshot.params['productId']), amount:1})
  }
}
