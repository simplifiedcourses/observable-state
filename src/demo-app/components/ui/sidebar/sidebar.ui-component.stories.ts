import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { SidebarUiComponent } from './sidebar.ui-component';

export default {
  title: 'SidebarUiComponent',
  component: SidebarUiComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
} as Meta<SidebarUiComponent>;

const Template: Story<SidebarUiComponent> = (args: SidebarUiComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {
  categories: null,
};
