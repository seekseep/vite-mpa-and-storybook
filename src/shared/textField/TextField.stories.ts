import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from './TextField';

const meta = {
  title: 'Example/TextField',
  component: TextField,
  tags: ['autodocs'],
  parameters: {
  },
  args: {
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    label: '氏名',
    disabled: false,
    type: 'text'
  },
};

export const Disabled: Story = {
  args: {
    label: '氏名',
    disabled: true,
    type: 'text'
  },
};

export const Number: Story = {
  args: {
    label: '年齢',
    disabled: false,
    type: 'number'
  },
};
