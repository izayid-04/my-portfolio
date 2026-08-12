"use client"

import { motion, AnimatePresence } from "motion/react"
import { BotMessageSquare, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatToggleButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export function ChatToggleButton({ isOpen, onClick, className }: ChatToggleButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "fixed z-50 flex items-center justify-center rounded-full shadow-lg cursor-pointer",
        "bg-primary text-primary-foreground",
        "hover:shadow-xl hover:scale-105 active:scale-95 transition-shadow",
        "bottom-4 right-3 size-12 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:right-5 sm:size-14",
        "max-sm:right-[max(0.75rem,env(safe-area-inset-right))] max-sm:bottom-[max(1rem,env(safe-area-inset-bottom))]",
        className,
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? "Fermer l'assistant IA" : "Discuter avec l'assistant IA"}
    >
      {!isOpen && (
        <span className="absolute inset-0 rounded-full animate-ping bg-primary/30 pointer-events-none" />
      )}
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.span
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="size-5 sm:size-6" />
          </motion.span>
        ) : (
          <motion.span
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BotMessageSquare className="size-5 sm:size-6" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
