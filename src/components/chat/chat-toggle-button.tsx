"use client"

import { motion, AnimatePresence } from "motion/react"
import { useTranslations } from "next-intl"
import { BotMessageSquare, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatToggleButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export function ChatToggleButton({ isOpen, onClick, className }: ChatToggleButtonProps) {
  const t = useTranslations("chat")
  return (
    <div
      className={cn(
        "fixed z-50",
        "bottom-4 right-3 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:right-5",
        "max-sm:right-[max(0.75rem,env(safe-area-inset-right))] max-sm:bottom-[max(1rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <motion.button
        onClick={onClick}
        className={cn(
          "relative flex items-center justify-center rounded-full cursor-pointer",
          "size-12 sm:size-14",
          "bg-primary text-primary-foreground",
          "shadow-lg ring-1 ring-inset ring-white/15",
          "hover:shadow-xl active:scale-95 transition-shadow",
        )}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? t("toggleClose") : t("toggleOpen")}
      >
        {!isOpen && (
          <>
            <span
              className="absolute -inset-2.5 -z-10 rounded-full bg-[conic-gradient(from_0deg,theme(colors.foreground/50%),transparent_35%,transparent_65%,theme(colors.foreground/50%))] opacity-60 blur-md animate-[spin_6s_linear_infinite] pointer-events-none"
              aria-hidden
            />
            <span
              className="absolute -inset-1.5 -z-10 rounded-full bg-foreground/20 opacity-60 blur-lg animate-pulse pointer-events-none"
              aria-hidden
            />
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/30 pointer-events-none" />
          </>
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
    </div>
  )
}
