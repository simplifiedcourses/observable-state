import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './demo-app/app/app.component';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ShellSmartComponent } from './demo-app/components/smart/shell/shell.smart-component';
import { ProductOverviewSmartComponent } from './demo-app/components/smart/product-overview/product-overview.smart-component';
import { ProductDetailSmartComponent } from './demo-app/components/smart/product-detail/product-detail.smart-component';
import {
  CategoryDetailSmartComponent
} from './demo-app/components/smart/category-detail/category-detail.smart-component';
import { ShoppingCartSmartComponent } from './demo-app/components/smart/shopping-cart/shopping-cart.smart-component';


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(RouterModule.forRoot([
      {
        path: '',
        component: ShellSmartComponent,
        children: [
          {
            path: '',
            redirectTo: 'products',
            pathMatch: 'full',
          },
          {
            path: 'products',
            component: ProductOverviewSmartComponent,
          },
          {
            path: 'products/:productId',
            component: ProductDetailSmartComponent,
          },
          {
            path: 'categories/:categoryId',
            component: CategoryDetailSmartComponent,
          },
          {
            path: 'categories/:categoryId/:productId',
            component: ProductDetailSmartComponent,
          },
          {
            path: 'payment',
            component: ShoppingCartSmartComponent,
          },
        ]
      }
    ]))]
})
