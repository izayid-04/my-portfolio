"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { AnimatePresence } from "motion/react"
import { ChatToggleButton } from "./chat-toggle-button"
import { ChatPanel } from "./chat-panel"
import type { ChatMessage } from "@/types/chat"

const STREAM_TICK_MS = 20
const STREAM_TOTAL_TICKS = 55

const SIMULATED_RESPONSES = [
  "Merci pour ta question ! Iza est un développeur full-stack orienté backend & DevOps, passionné par Laravel, Spring Boot, Nest.js, Angular et Next.js.",
  "Iza travaille principalement avec Laravel, Spring Boot et Nest.js côté backend, et Angular/Next.js côté frontend. Il maîtrise aussi Docker, Linux et le déploiement cloud.",
  "N'hésite pas à consulter la section projets du portfolio pour voir des exemples concrets de réalisations !",
  "Bonne question ! Tu peux contacter Iza directement via la page Contact du site.",
  "Iza est aussi à l'aise avec les bases de données relationnelles : PostgreSQL, MySQL, Oracle, SQL Server et SQLite.",
]

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function Chatbot() {
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
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json().catch(() => ({}))
      reply =
        res.ok && typeof data?.reply === "string"
          ? data.reply
          : SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)]
    } catch {
      reply = SIMULATED_RESPONSES[0]
    }

    setIsTyping(false)
    const botId = generateId()
    setMessages((prev) => [
      ...prev,
      { id: botId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
    ])
    streamReply(botId, reply)
  }, [input, isTyping, isStreaming, streamReply])

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
