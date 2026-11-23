// Real plans and limits, copied from app.graphon.ai/settings/billing (21 Nov 2026)
export type PlanId = 'free' | 'personal' | 'team' | 'business' | 'enterprise'

export interface Plan {
  id: PlanId
  name: string
  monthly: number | null
  storageGB: number
  queries: number
  users: number
  features: string[]
}

export const PLANS: Record<PlanId, Plan> = {
  free: { id: 'free', name: 'Free', monthly: 0, storageGB: 100, queries: 100, users: 1, features: ['S3 compatible API', 'Search/answer/research API', 'Claude/Codex/Grok plugin'] },
  personal: { id: 'personal', name: 'Personal', monthly: 25, storageGB: 100, queries: 500, users: 3, features: ['S3 compatible API', 'Search', 'Answers', 'Research', 'MCP server for coding agents'] },
  team: { id: 'team', name: 'Team', monthly: 100, storageGB: 1000, queries: 25000, users: 10, features: ['Everything in Personal', 'Role based access control', 'Workspace API keys and webhooks', 'Email support'] },
  business: { id: 'business', name: 'Business', monthly: 500, storageGB: 5000, queries: 100000, users: Infinity, features: ['Everything in Team', 'Security and compliance documents', 'Onboarding help for your team', 'Priority support'] },
  enterprise: { id: 'enterprise', name: 'Enterprise', monthly: null, storageGB: Infinity, queries: Infinity, users: Infinity, features: ['Everything in Business', 'SSO with SAML or OIDC', 'SCIM provisioning', 'SOC 2 Type II report', 'HIPAA with a BAA', 'Audit logs', 'Uptime SLA'] },
}

export const ORDER: PlanId[] = ['free', 'personal', 'team', 'business', 'enterprise']

export function nextPlan(id: PlanId): Plan {
  return PLANS[ORDER[Math.min(ORDER.indexOf(id) + 1, ORDER.length - 1)]]
}

export function fmtNum(n: number) {
  if (n === Infinity) return 'Unlimited'
  if (n >= 1000) return `${n / 1000}K`
  return String(n)
}

export function fmtStorage(gb: number) {
  if (gb === Infinity) return 'Unlimited'
  if (gb >= 1000) return `${gb / 1000} TB`
  return `${gb} GB`
}
