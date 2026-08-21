"use client"

import { useEffect } from "react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ContactConfirmationModalProps {
  open: boolean
  onClose: () => void
}

export function ContactConfirmationModal({ open, onClose }: ContactConfirmationModalProps) {
  const t = useTranslations("contact")
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl border border-border bg-card p-6 shadow-xl max-w-sm w-full text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <CheckCircle2 className="size-10 text-primary" aria-hidden />
          </div>
        </div>
        <h2 id="confirmation-title" className="text-lg font-semibold text-foreground mb-2">
          {t("sent")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t("confirmationBody")}
        </p>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground cursor-pointer",
            "hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          {t("close")}
        </button>
      </motion.div>
    </motion.div>
  )
}
