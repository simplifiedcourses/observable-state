import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { ProductDetailSmartComponent } from './product-detail.smart-component';

export default {
  title: 'ProductDetailSmartComponent',
  component: ProductDetailSmartComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
} as Meta<ProductDetailSmartComponent>;

const Template: Story<ProductDetailSmartComponent> = (
  args: ProductDetailSmartComponent
) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {};
