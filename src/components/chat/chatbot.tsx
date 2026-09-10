"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { AnimatePresence } from "motion/react"
import { useLocale } from "next-intl"
import { ChatToggleButton } from "./chat-toggle-button"
import { ChatPanel } from "./chat-panel"
import type { ChatMessage } from "@/types/chat"

const STREAM_TICK_MS = 20
const STREAM_TOTAL_TICKS = 55

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function Chatbot() {
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
    }
  }, [])

  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  const streamReply = useCallback((id: string, fullText: string) => {
    setIsStreaming(true)
    let revealed = 0
    const charsPerTick = Math.max(1, Math.ceil(fullText.length / STREAM_TOTAL_TICKS))

    streamIntervalRef.current = setInterval(() => {
      revealed = Math.min(fullText.length, revealed + charsPerTick)
      const done = revealed >= fullText.length

      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, content: fullText.slice(0, revealed), isStreaming: !done }
            : m,
        ),
      )

      if (done) {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
        streamIntervalRef.current = null
        setIsStreaming(false)
      }
    }, STREAM_TICK_MS)
  }, [])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isTyping || isStreaming) return

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    let reply: string
    const fallbackReply =
      locale === "en"
        ? "I can help with Iza's portfolio, skills, projects, and contact information."
        : "Je peux t’aider sur le portfolio d’Iza, ses compétences, ses projets et son contact."

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, locale }),
      })
      const data = await res.json().catch(() => ({}))
      const apiError = typeof data?.error === "string" ? data.error : null

      reply =
        res.ok && typeof data?.reply === "string"
          ? data.reply
          : apiError || fallbackReply
    } catch {
      reply = fallbackReply
    }

    setIsTyping(false)
    const botId = generateId()
    setMessages((prev) => [
      ...prev,
      { id: botId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
    ])
    streamReply(botId, reply)
  }, [input, isTyping, isStreaming, streamReply, locale])

  return (
    <>
      <ChatToggleButton isOpen={isOpen} onClick={toggle} />

      <AnimatePresence>
        {isOpen && (
          <ChatPanel
            messages={messages}
            input={input}
            isTyping={isTyping}
            disabled={isTyping || isStreaming}
            onInputChange={setInput}
            onSend={sendMessage}
            onClose={toggle}
          />
        )}
      </AnimatePresence>
    </>
  )
}
