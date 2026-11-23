import type { Meta, StoryObj } from '@storybook/react-vite'
import { UpgradeDialog } from '@/components/usage/upgrade-dialog'
import { BillingPage } from '@/pages/billing'
import { HomePage } from '@/pages/home'
import { UsagePage } from '@/pages/usage'

const meta = { title: 'Pages', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const page = (P: () => React.JSX.Element) => () => (<><P /><UpgradeDialog /></>)

export const Home: Story = { render: page(HomePage) }
export const Usage: Story = { render: page(UsagePage) }
export const Billing: Story = { render: page(BillingPage) }
