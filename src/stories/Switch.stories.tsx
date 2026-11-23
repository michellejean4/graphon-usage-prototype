import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

const meta = { title: 'Components/Switch', component: Switch, args: { checked: true, label: 'Email at 80%', onChange: () => {} } } satisfies Meta<typeof Switch>
export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
  render: (args) => {
    const [on, setOn] = useState(args.checked)
    return <Switch {...args} checked={on} onChange={setOn} />
  },
}
