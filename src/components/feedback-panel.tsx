import { Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { GraphonMark } from '@/components/logo'
import { cn } from '@/lib/utils'

// Same feedback drawer as app.graphon.ai: slides in from the right, chat with the team
type Msg = { from: 'team' | 'me'; text: string }

const FIRST: Msg = { from: 'team', text: 'Thanks for trying Graphon. Tell us about a bug you hit or something you want — I read every message.' }

export function FeedbackPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([FIRST])
  const [draft, setDraft] = useState('')
  const input = useRef<HTMLTextAreaElement>(null)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => input.current?.focus(), 150)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setMsgs((m) => [...m, { from: 'me', text }])
    setDraft('')
    setTimeout(() => setMsgs((m) => [...m, { from: 'team', text: "Got it, thank you. We'll reply here and by email, usually within a day." }]), 900)
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn('fixed inset-0 z-40 bg-black/10 backdrop-blur-[4px] transition-opacity duration-200', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
      />
      <aside
        role="dialog"
        aria-label="Feedback"
        aria-hidden={!open}
        inert={!open}
        className={cn('fixed inset-y-0 right-0 z-50 flex w-full max-w-96 flex-col border-l bg-card text-card-foreground shadow-2xl transition-transform duration-200 ease-out', open ? 'translate-x-0' : 'translate-x-full')}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg border bg-background"><GraphonMark className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Feedback</div>
            <div className="text-xs text-muted-foreground">Usually replies within a day</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 text-sm">
          {msgs.map((m, i) =>
            m.from === 'team' ? (
              <div key={i} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium">RS</span>
                <div className="min-w-0">
                  {(i === 0 || msgs[i - 1].from !== 'team') && <div className="mb-1 font-medium">Robert Sweeney</div>}
                  <div className="rounded-[11px] rounded-bl-[5px] bg-secondary px-3 py-2">{m.text}</div>
                  {i === 0 && <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="size-3" /> Graphon AI answers first when the docs cover it.</div>}
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-[11px] rounded-br-[5px] bg-primary px-3 py-2 text-primary-foreground">{m.text}</div>
              </div>
            ),
          )}
          <div ref={end} />
        </div>

        <div className="p-3">
          <div className="rounded-xl border bg-background p-2.5 focus-within:border-foreground/30">
            <textarea
              ref={input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              rows={2}
              placeholder="Message Graphon..."
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Enter to send · Shift + Enter for a new line</span>
              <button onClick={send} disabled={!draft.trim()} aria-label="Send" className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-30">
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
