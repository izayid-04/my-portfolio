"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Loader2, X } from "lucide-react"

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "primary" | "warning"
  isLoading?: boolean
  icon?: React.ReactNode
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Êtes-vous absolument sûr ?",
  description = "Cette action est irréversible. Voulez-vous vraiment continuer ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "destructive",
  isLoading = false,
  icon,
}: ConfirmModalProps) {
  const [internalLoading, setInternalLoading] = React.useState(false)

  // Fermeture avec la touche Échap (ESC)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading && !internalLoading) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, isLoading, internalLoading])

  const handleConfirmClick = async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
    } finally {
      setInternalLoading(false)
    }
  }

  const loadingState = isLoading || internalLoading

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop sombre flouté */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loadingState && onClose()}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Fenêtre Modale Shadcn */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="relative z-50 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5"
          >
            {/* Bouton fermeture X */}
            <button
              type="button"
              onClick={onClose}
              disabled={loadingState}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <X className="size-4" />
            </button>

            {/* En-tête avec Icône */}
            <div className="flex items-start gap-4">
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${
                  variant === "destructive"
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                    : variant === "warning"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                    : "border-primary/30 bg-primary/10 text-primary"
                }`}
              >
                {icon || <AlertTriangle className="size-6" />}
              </div>

              <div className="space-y-1 pr-4">
                <h3 className="text-base font-bold text-foreground leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Actions / Boutons de confirmation */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                disabled={loadingState}
                className="cursor-pointer rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={handleConfirmClick}
                disabled={loadingState}
                className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold shadow-md transition-all disabled:opacity-50 ${
                  variant === "destructive"
                    ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20"
                    : variant === "warning"
                    ? "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                }`}
              >
                {loadingState ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Traitement...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
