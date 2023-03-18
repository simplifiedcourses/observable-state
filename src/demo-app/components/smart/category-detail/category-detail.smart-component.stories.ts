import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { CategoryDetailSmartComponent } from './category-detail.smart-component';

export default {
  title: 'CategoryDetailSmartComponent',
  component: CategoryDetailSmartComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
} as Meta<CategoryDetailSmartComponent>;

const Template: Story<CategoryDetailSmartComponent> = (
  args: CategoryDetailSmartComponent
) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {};
