import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Share2,
  UserCircle2,
  MessageSquare,
  ChevronRight,
  Zap,
  Bot,
  BarChart2,
  Megaphone,
  Sparkles,
  Loader2,
  Menu,
  AlertCircle,
  X,
  Building2,
  RefreshCw,
} from 'lucide-react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useChat, type ChatMessage } from '../hooks/useChat'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { useAuth } from '../context/AuthContext'
import MarkdownRenderer from '../components/ui/MarkdownRenderer'

// ── Static UI data (visual only) ──────────────────

const mentionedAgents = [
  { name: 'CEO Agent', icon: UserCircle2, color: 'text-violet-300', border: 'border-violet-400/40', gradient: true },
  { name: 'Finance', icon: BarChart2, color: 'text-cyan-400', border: 'border-cyan-400/40', gradient: false },
  { name: 'Marketing', icon: Megaphone, color: 'text-blue-400', border: 'border-blue-400/40', gradient: false },
]

// ── Message Bubble ─────────────────────────────────

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="max-w-4xl mx-auto flex gap-3 sm:gap-6 px-2 sm:px-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2d3449] flex-shrink-0 flex items-center justify-center">
        <UserCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#cbc3d7]" />
      </div>
      <div className="space-y-1 flex-1 min-w-0">
        <p className={`text-sm sm:text-base text-[#dae2fd] leading-relaxed whitespace-pre-wrap break-words ${message.pending ? 'opacity-80' : ''}`}>
          {message.content}
        </p>
        <p className="text-[10px] text-[#958ea0]">
          {message.pending ? 'Sending…' : message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

function AIBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="max-w-4xl mx-auto flex gap-3 sm:gap-6 px-2 sm:px-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 p-[1px] flex-shrink-0">
        <div className="w-full h-full bg-[#0b1326] rounded-full flex items-center justify-center">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-violet-300" />
        </div>
      </div>
      <div className="space-y-3 flex-1 min-w-0">
        <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-violet-300" />
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">ExecOS AI</span>
          </div>
          <p className="text-sm sm:text-base text-[#dae2fd] leading-relaxed whitespace-pre-wrap break-words">
            <MarkdownRenderer content={message.content} />
          </p>
        </div>
        <p className="text-[10px] text-[#958ea0] px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

function ErrorBanner({ message, onDismiss, onRetry }: { message: string; onDismiss: () => void; onRetry?: () => void }) {
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
        <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-sm text-red-300">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1 flex-shrink-0"
          >
            <RefreshCw size={12} /> Retry
          </button>
        )}
        <button onClick={onDismiss} aria-label="Dismiss error">
          <X size={14} className="text-red-400/60 hover:text-red-400" />
        </button>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="max-w-4xl mx-auto flex gap-3 sm:gap-6 px-2 sm:px-4" aria-live="polite" aria-label="AI is responding">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 p-[1px] flex-shrink-0">
        <div className="w-full h-full bg-[#0b1326] rounded-full flex items-center justify-center">
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-violet-300 animate-spin" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[#cbc3d7] py-3">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

function HistoryLoadingState() {
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-12 flex flex-col items-center gap-3 text-[#cbc3d7]">
      <Loader2 className="w-6 h-6 text-violet-300 animate-spin" />
      <p className="text-sm">Loading conversation history…</p>
    </div>
  )
}

function EmptyChatState({ businessName, businessId }: { businessName: string; businessId: string }) {
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 p-5 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 p-[2px] mx-auto mb-4">
          <div className="w-full h-full bg-[#0b1326] rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-300" />
          </div>
        </div>
        <h3 className="text-base font-semibold text-[#dae2fd] mb-1">Ready to answer your questions</h3>
        <p className="text-sm text-[#cbc3d7]">
          Ask anything about <span className="text-violet-300 font-medium">{businessName}</span> based on its uploaded documents.
        </p>
        <Link
          to={`/business/${businessId}/documents`}
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-violet-300 hover:text-violet-200 transition"
        >
          Upload more documents <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// ── Business Selector ────────────────────────────────

interface BusinessSelectorProps {
  workspaces: { id: string; name: string }[]
  businesses: { id: string; name: string; workspaceId: string }[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function BusinessSelectorBanner({ workspaces, businesses, selectedId, onSelect }: BusinessSelectorProps) {
  if (selectedId) return null

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
      <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Building2 size={18} className="text-violet-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#dae2fd]">Select a Business</h3>
            <p className="text-xs text-[#cbc3d7]">Choose a business to chat with its uploaded documents</p>
          </div>
        </div>
        {businesses.length === 0 ? (
          <div className="text-center py-4">
            <Sparkles className="w-8 h-8 text-violet-300/40 mx-auto mb-2" />
            <p className="text-sm text-[#cbc3d7]">No businesses found.</p>
            <Link to="/workspace" className="text-xs text-violet-300 hover:text-violet-200 transition mt-1 inline-block">
              Create a workspace first →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {businesses.map((business) => {
              const workspace = workspaces.find((ws) => ws.id === business.workspaceId)
              return (
                <button
                  key={business.id}
                  onClick={() => onSelect(business.id)}
                  className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/5 hover:bg-violet-500/10 hover:border-violet-400/30 p-3 text-left transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                    <Building2 size={15} className="text-violet-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#dae2fd] truncate">{business.name}</p>
                    {workspace && <p className="text-[10px] text-[#958ea0] truncate">{workspace.name}</p>}
                  </div>
                  <ChevronRight size={14} className="text-[#958ea0] flex-shrink-0 mt-1 ml-auto" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────

export default function ChatPage() {
  const { businessId: routeBusinessId } = useParams<{ businessId: string }>()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    routeBusinessId ?? searchParams.get('business') ?? null
  )
  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const {
    messages,
    isHistoryLoading,
    isSending,
    historyError,
    sendError,
    sendMessage,
    reloadHistory,
    clearSendError,
    clearHistoryError,
  } = useChat(selectedBusinessId)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)

  const { workspaces } = useWorkspaces()
  const [allBusinesses, setAllBusinesses] = useState<{ id: string; name: string; workspaceId: string }[]>([])

  useEffect(() => {
    if (workspaces.length === 0) return
    import('../services/businessService').then(({ getWorkspaceBusinesses }) => {
      Promise.allSettled(workspaces.map((ws) => getWorkspaceBusinesses(ws.id))).then((results) => {
        const all: { id: string; name: string; workspaceId: string }[] = []
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            result.value.forEach((business) =>
              all.push({ id: business.id, name: business.name, workspaceId: workspaces[index].id })
            )
          }
        })
        setAllBusinesses(all)
      })
    })
  }, [workspaces])

  const selectedBusiness = allBusinesses.find((business) => business.id === selectedBusinessId)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current
    if (!container || !shouldAutoScrollRef.current) return

    requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior })
    })
  }, [])

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    shouldAutoScrollRef.current = distanceFromBottom < 120
  }, [])

  useEffect(() => {
    if (!isHistoryLoading) {
      scrollToBottom('instant')
    }
  }, [isHistoryLoading, selectedBusinessId, scrollToBottom])

  useEffect(() => {
    scrollToBottom(isSending ? 'smooth' : 'smooth')
  }, [messages.length, isSending, scrollToBottom])

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const historyPreviews = messages
    .filter((message) => message.role === 'user')
    .slice(-5)
    .reverse()

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isSending || !selectedBusinessId) return

    shouldAutoScrollRef.current = true
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    await sendMessage(text)
  }, [input, isSending, selectedBusinessId, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const showEmptyState =
    selectedBusinessId &&
    !isHistoryLoading &&
    !historyError &&
    messages.length === 0 &&
    !isSending

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 lg:left-72 z-10 flex overflow-hidden bg-[#0b1326]">

      {/* ── Sidebar (fixed on desktop, drawer on mobile) ── */}
      <div
        className={`
          fixed top-16 bottom-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:flex lg:flex-shrink-0 lg:z-auto
        `}
      >
        <aside className="w-80 h-full border-r border-white/10 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl flex flex-col min-h-0 overflow-hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-[#cbc3d7] hover:text-white transition-colors p-2"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>

          <div className="flex-shrink-0 p-4 sm:p-6 border-b border-white/10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7] mb-3 sm:mb-4">
              Mentioned Agents
            </h2>
            <div className="flex gap-3">
              {mentionedAgents.map((agent) => (
                <div key={agent.name} className="group relative">
                  <div
                    className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[2px] cursor-pointer transition-all duration-300 hover:scale-110
                      ${agent.gradient ? 'bg-gradient-to-r from-violet-400 to-cyan-400' : `border ${agent.border}`}
                    `}
                  >
                    <div className="w-full h-full bg-[#171f33] rounded-full flex items-center justify-center">
                      <agent.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${agent.color}`} />
                    </div>
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#2d3449] px-2 py-1 rounded text-[10px] text-[#cbc3d7] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {agent.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7] mb-3 sm:mb-4 px-2">
              History
            </h2>
            <div className="space-y-1">
              {historyPreviews.length > 0 ? (
                historyPreviews.map((message) => (
                  <div
                    key={message.id}
                    className="w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 text-[#cbc3d7] hover:bg-white/5 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-300/50" />
                    <span className="text-xs sm:text-sm line-clamp-2 break-words">{message.content}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#958ea0] px-3 py-2">No messages yet</p>
              )}
            </div>

            {selectedBusiness && (
              <div className="mt-4 px-3 py-2.5 rounded-xl bg-violet-500/10 border border-violet-400/20">
                <p className="text-[10px] uppercase tracking-wider text-violet-300 mb-1">Active Context</p>
                <div className="flex items-center gap-2">
                  <Building2 size={12} className="text-violet-300 flex-shrink-0" />
                  <p className="text-xs text-[#dae2fd] truncate">{selectedBusiness.name}</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main chat window (header + scrollable messages + fixed input) ── */}
      <main className="flex-1 flex flex-col relative bg-[#0b1326] min-w-0 min-h-0 overflow-hidden">

        <header className="h-14 sm:h-16 flex-shrink-0 flex items-center justify-between px-3 sm:px-6 border-b border-white/10 bg-[#0b1326]/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#cbc3d7] hover:text-white transition-colors p-1.5"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm sm:text-lg md:text-2xl font-semibold text-[#dae2fd] truncate">
              {selectedBusiness?.name ?? 'ExecOS AI Chat'}
            </span>
            {selectedBusinessId && (
              <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium uppercase tracking-wider bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/30 whitespace-nowrap">
                RAG Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#cbc3d7]" />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-400/20">
              <span className="text-xs font-bold text-violet-300">{userInitials}</span>
            </div>
          </div>
        </header>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-3 sm:p-6 space-y-6 sm:space-y-8"
        >
          <BusinessSelectorBanner
            workspaces={workspaces}
            businesses={allBusinesses}
            selectedId={selectedBusinessId}
            onSelect={setSelectedBusinessId}
          />

          {historyError && (
            <ErrorBanner
              message={historyError}
              onDismiss={clearHistoryError}
              onRetry={reloadHistory}
            />
          )}

          {sendError && (
            <ErrorBanner
              message={sendError}
              onDismiss={clearSendError}
            />
          )}

          {isHistoryLoading && selectedBusinessId && <HistoryLoadingState />}

          {showEmptyState && selectedBusiness && (
            <EmptyChatState
              businessName={selectedBusiness.name}
              businessId={selectedBusinessId}
            />
          )}

          {messages.map((message) => {
            if (message.role === 'user') return <UserBubble key={message.id} message={message} />
            if (message.role === 'ai') return <AIBubble key={message.id} message={message} />
            return null
          })}

          {isSending && <TypingIndicator />}
        </div>

        {/* ── Compact input area ──────────────────── */}
        <div className="flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 border-t border-white/10 bg-[#0b1326]/95 backdrop-blur-xl z-30">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 bg-[rgba(23,31,51,0.72)] border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-violet-400/40 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={
                  !selectedBusinessId
                    ? 'Select a business to chat…'
                    : isHistoryLoading
                      ? 'Loading…'
                      : 'Ask about your documents…'
                }
                disabled={!selectedBusinessId || isSending || isHistoryLoading}
                rows={1}
                className="flex-1 bg-transparent border-none focus:outline-none text-[#dae2fd] placeholder:text-[#958ea0] text-sm py-1.5 resize-none min-h-[32px] max-h-[120px] leading-snug disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !selectedBusinessId || isSending || isHistoryLoading}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-300 to-cyan-400 text-[#340080] hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                {isSending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${selectedBusinessId ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-[10px] text-[#958ea0]">
                  {selectedBusinessId ? 'RAG active' : 'No business selected'}
                </span>
              </div>
              <span className="text-[10px] text-[#958ea0] hidden sm:inline">Enter to send · Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
