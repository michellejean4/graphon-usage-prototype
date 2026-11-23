import type { Meta, StoryObj } from '@storybook/react-vite'
import { UsageBanner } from '@/components/usage/usage-banner'

const meta = {
  title: 'Patterns/Usage banner',
  component: UsageBanner,
  parameters: { docs: { description: { component: 'Shown on Home and Usage. Switch the Usage toolbar to see each state: a quiet Free line, the 80% heads up, and the paused state.' } } },
} satisfies Meta<typeof UsageBanner>
export default meta
type Story = StoryObj<typeof meta>

export const PlentyLeft: Story = { globals: { usage: 'plenty' } }
export const GettingClose: Story = { globals: { usage: 'close' } }
export const OutOfQueries: Story = { globals: { usage: 'out' } }
