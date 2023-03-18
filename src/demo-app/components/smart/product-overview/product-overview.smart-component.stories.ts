import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { ProductOverviewSmartComponent } from './product-overview.smart-component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

export default {
  title: 'ProductOverviewSmartComponent',
  component: ProductOverviewSmartComponent,
  decorators: [
    moduleMetadata({
      imports: [
        HttpClientModule,
        RouterModule.forRoot([
          {
            path: '',
            component: ProductOverviewSmartComponent
          }
        ], {useHash: true})
      ],
    }),
  ],
} as Meta<ProductOverviewSmartComponent>;

export const Primary: StoryFn = () => ({
  template: `<router-outlet></router-outlet>`
})
