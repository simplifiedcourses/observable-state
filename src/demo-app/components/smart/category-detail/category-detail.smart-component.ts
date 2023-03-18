import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { SidebarUiComponent } from '../../ui/sidebar/sidebar.ui-component';
import { BreadcrumbItem } from '../../../types/breadcrumb-item.type';
import { BreadcrumbUiComponent } from '../../ui/breadcrumb/breadcrumb.ui-component';
import { ProductUiComponent } from '../../ui/product/product.ui-component';
import { FacadeService } from '../../../services/facade.service';

@Component({
  selector: 'sh-category-detail',
  standalone: true,
  imports: [
    CommonModule,
    SidebarUiComponent,
    ProductUiComponent,
    BreadcrumbUiComponent,
  ],
  templateUrl: './category-detail.smart-component.html',
  styleUrls: ['./category-detail.smart-component.scss'],
})
export class CategoryDetailSmartComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly facadeService = inject(FacadeService);
  public readonly category$ = this.activatedRoute.params.pipe(
    switchMap((params) =>
      this.facadeService.getCategoryByd(Number(params['categoryId']))
    )
  );
  public readonly breadcrumbItems$: Observable<BreadcrumbItem[]> =
    this.category$.pipe(
      map((category) => {
        return [
          {
            label: 'Home',
            route: [''],
          },
          {
            label: 'Products',
            route: ['/products'],
          },
          {
            label: category.name,
            route: ['/categories', category.id.toString()],
          },
        ];
      })
    );
  public readonly categories$ = this.facadeService.getCategories();

  private readonly products$ = this.facadeService.getProducts();
  public readonly productsByCategory$ = combineLatest([
    this.products$,
    this.category$,
  ]).pipe(
    map(([products, category]) =>
      products.filter((product) => product.categoryId === category.id)
    )
  );
}
