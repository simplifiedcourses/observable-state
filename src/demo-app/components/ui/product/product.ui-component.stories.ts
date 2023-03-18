import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { ProductUiComponent } from './product.ui-component';

export default {
  title: 'ProductUiComponent',
  component: ProductUiComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
} as Meta<ProductUiComponent>;

const Template: Story<ProductUiComponent> = (args: ProductUiComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {
  product: null,
};
