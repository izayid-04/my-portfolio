"use client"

import { useRef, useEffect } from "react"
import { motion } from "motion/react"
import { useLocale, useTranslations } from "next-intl"
import { Bot, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import type { ChatMessage } from "@/types/chat"

interface ChatPanelProps {
  messages: ChatMessage[]
  input: string
  isTyping: boolean
  disabled?: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onClose: () => void
}

function formatTime(date: Date, locale: string) {
  return date.toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" })
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 max-w-[80%]">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="size-3.5 text-muted-foreground" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block size-1.5 rounded-full bg-muted-foreground/60"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const locale = useLocale()
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex items-end gap-2 max-w-[85%]", isUser && "ml-auto flex-row-reverse")}
    >
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <Bot className="size-3.5 text-muted-foreground" />
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-muted text-foreground",
          )}
        >
          {message.content}
          {message.isStreaming && (
            <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] animate-pulse bg-current" />
          )}
        </div>
        <span
          className={cn(
            "text-[10px] text-muted-foreground/60 px-1",
            isUser ? "text-right" : "text-left",
          )}
        >
          {formatTime(message.timestamp, locale)}
        </span>
      </div>
    </motion.div>
  )
}

export function ChatPanel({
  messages,
  input,
  isTyping,
  disabled = false,
  onInputChange,
  onSend,
  onClose,
}: ChatPanelProps) {
  const t = useTranslations("chat")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%", scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: "100%", scale: 0.95 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden",
        "bg-background/95 backdrop-blur-xl border border-border shadow-2xl",
        "top-1/2 -translate-y-1/2 right-4 sm:right-6 w-[calc(100vw-2rem)] max-w-[460px] h-[min(82vh,700px)] rounded-2xl",
        "max-sm:top-0 max-sm:translate-y-0 max-sm:left-0 max-sm:right-0 max-sm:w-full max-sm:max-w-none max-sm:h-[100dvh] max-sm:rounded-none",
      )}
    >
      {/* Ambient gradient glow, bottom-anchored */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-2/3" aria-hidden>
        <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(70%_80%_at_50%_100%,theme(colors.teal.600/35%),transparent_70%)] blur-2xl" />
        <div className="absolute -bottom-10 left-1/4 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute -bottom-10 right-1/4 h-56 w-56 translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
          <Bot className="size-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{siteConfig.assistantName}</h3>
          <div className="flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs text-muted-foreground">{t("online")}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer"
          aria-label={t("closePanel")}
        >
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Bot className="size-7 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {t("greeting", { name: siteConfig.assistantName })}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("greetingHint")}
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-border p-3 pb-3 sm:pb-3 max-sm:pb-4">
        <div className="flex items-end gap-2 rounded-xl bg-muted/50 border border-border px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background transition-shadow">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none max-h-24 min-h-[1.5rem] disabled:opacity-60"
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || disabled}
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg transition-all cursor-pointer",
              input.trim() && !disabled
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
            aria-label={t("send")}
          >
            <Send className="size-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
          {t("poweredBy")}
        </p>
      </div>
    </motion.div>
  )
}
