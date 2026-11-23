import type { Meta, StoryObj } from '@storybook/react-vite'
import { Meter } from '@/components/ui/meter'

const meta = {
  title: 'Components/Meter',
  component: Meter,
  args: { value: 86, max: 100, color: 'aqua' },
  argTypes: {
    color: { control: 'inline-radio', options: ['aqua', 'mint', 'coral'] },
    tone: { control: 'inline-radio', options: [undefined, 'default', 'destructive'] },
    size: { control: 'inline-radio', options: ['default', 'sm'] },
  },
  decorators: [(S) => <div className="max-w-md"><S /></div>],
} satisfies Meta<typeof Meter>
export default meta
type Story = StoryObj<typeof meta>

export const Queries: Story = {}
export const Storage: Story = { args: { value: 41.2, color: 'mint' } }
export const Members: Story = { args: { value: 1, max: 1, color: 'coral', tone: 'default' } }
export const AtLimit: Story = { args: { value: 100, max: 100 } }
