import { useEffect, useRef, useState } from 'react'
import { getChatHistory, sendChatMessage, clearChatHistory } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/ui/avatar'
import type { ChatMessage } from '@/types'
import { Send, Trash2, Loader2, TrendingUp, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  'How much did I spend this month?',
  'What is my biggest spending category?',
  'Am I over budget anywhere?',
  'Give me tips to save money on food',
  'Summarise my financial health',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getChatHistory()
      .then(setMessages)
      .finally(() => setFetching(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const { reply } = await sendChatMessage(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e: unknown) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I couldn't process that. ${e instanceof Error ? e.message : ''}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    await clearChatHistory()
    setMessages([])
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] animate-fade-in">
     
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Powered by Groq · Llama 3
          </span>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost" size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleClear}
          >
            <Trash2 className="w-3 h-3 mr-1.5" /> Clear chat
          </Button>
        )}
      </div>

     
      <ScrollArea className="flex-1 pr-2 scrollbar-thin">
        {fetching ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Your AI Financial Adviser</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Ask me anything about your expenses, budgets, or get personalised money-saving tips.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 animate-slide-up ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                    <div className="w-full h-full rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    </div>
                  </Avatar>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-card border border-border text-foreground rounded-tl-sm'
                }`}>
                  {m.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-1.5' : ''}>{line}</p>
                  ))}
                </div>
                {m.role === 'user' && (
                  <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                    <div className="w-full h-full rounded-full bg-secondary border border-border flex items-center justify-center">
                      <span className="text-[10px] font-bold text-muted-foreground">U</span>
                    </div>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                  <div className="w-full h-full rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  </div>
                </Avatar>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  <span className="typing-dot w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

    
      <div className="pt-3 border-t border-border mt-3">
        {messages.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {SUGGESTIONS.slice(0, 3).map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all truncate max-w-[180px]"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your finances... (Enter to send)"
            className="resize-none min-h-[44px] max-h-32 bg-card border-border text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30 scrollbar-thin"
            rows={1}
          />
          <Button
            size="icon"
            className="h-11 w-11 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}