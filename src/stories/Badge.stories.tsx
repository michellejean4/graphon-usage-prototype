import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '@/components/ui/badge'

const meta = { title: 'Components/Badge', component: Badge, args: { children: 'Searchable' } } satisfies Meta<typeof Badge>
export default meta
type Story = StoryObj<typeof meta>

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Outline</Badge>
      <Badge variant="success">Searchable</Badge>
      <Badge variant="warning">Indexing</Badge>
      <Badge variant="destructive">Paused</Badge>
      <Badge variant="primary">Primary</Badge>
    </div>
  ),
}
