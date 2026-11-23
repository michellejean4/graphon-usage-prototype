import type { Decorator, Preview } from '@storybook/react-vite'
import { useEffect, type ReactNode } from 'react'
import { StoreProvider, useStore } from '../src/store'
import type { ScenarioId } from '../src/data/usage'
import '../src/index.css'

// Keeps the app store in step with the toolbar (theme + usage state)
function Sync({ dark, scenario, children }: { dark: boolean; scenario: ScenarioId; children: ReactNode }) {
  const { setDark, setScenario } = useStore()
  useEffect(() => setDark(dark), [dark, setDark])
  useEffect(() => setScenario(scenario), [scenario, setScenario])
  return <>{children}</>
}

const withApp: Decorator = (Story, ctx) => {
  const dark = ctx.globals.theme === 'dark'
  return (
    <StoreProvider>
      <Sync dark={dark} scenario={(ctx.globals.usage ?? 'close') as ScenarioId}>
        <div className="bg-background p-6 text-foreground">
          <Story />
        </div>
      </Sync>
    </StoreProvider>
  )
}

const preview: Preview = {
  decorators: [withApp],
  globalTypes: {
    theme: {
      description: 'Light or dark mode',
      toolbar: { title: 'Theme', icon: 'mirror', items: [{ value: 'light', title: 'Light' }, { value: 'dark', title: 'Dark' }], dynamicTitle: true },
    },
    usage: {
      description: 'How much of the plan has been used',
      toolbar: { title: 'Usage', icon: 'graphbar', items: [{ value: 'plenty', title: 'Plenty left' }, { value: 'close', title: 'Getting close' }, { value: 'out', title: 'Out of queries' }], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light', usage: 'close' },
  parameters: {
    layout: 'fullscreen',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'todo' },
  },
}

export default preview
