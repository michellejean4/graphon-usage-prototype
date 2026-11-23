import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarChart } from '@/components/bar-chart'

const meta = {
  title: 'Components/Bar chart',
  component: BarChart,
  args: { data: [7, 9, 3, 2, 11, 13, 14], labels: ['Nov 28', 'Nov 29', 'Nov 30', 'Dec 1', 'Dec 2', 'Dec 3', 'Dec 4'], highlight: 6 },
  decorators: [(S) => <div className="max-w-xl rounded-xl border bg-card p-4"><S /></div>],
} satisfies Meta<typeof BarChart>
export default meta
type Story = StoryObj<typeof meta>

export const QueriesPerDay: Story = {}
