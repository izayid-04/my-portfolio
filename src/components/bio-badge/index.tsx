"use client"

import { Suspense, useState } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "motion/react"
import { useTranslations } from "next-intl"
import { CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX } from "./constants"

const LanyardScene = dynamic(() => import("./lanyard-scene").then((m) => m.LanyardScene), {
  ssr: false,
})

/** Crochet/mousqueton stylise servant de bouton pour tirer/remonter le badge 3D. */
function HookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <defs>
        <linearGradient id="bio-hook-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5v4.2M8.4 5.4c1-1.3 2.2-1.9 3.6-1.9s2.6.6 3.6 1.9M6 9.5a6 6 0 0 1 12 0v3.2a6 6 0 0 1-12 0Z"
        fill="none"
        stroke="url(#bio-hook-metal)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="14.3" r="1.7" fill="none" stroke="url(#bio-hook-metal)" strokeWidth="1.6" />
      <path
        d="M12 16v3.5"
        fill="none"
        stroke="url(#bio-hook-metal)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function BioBadge() {
  const t = useTranslations("bioBadge")
  const [open, setOpen] = useState(false)

  // Resolu ici (hors du Canvas) : le Canvas R3F rend ses enfants dans un arbre
  // React separe (son propre reconciler) qui n'a pas acces au contexte
  // NextIntlClientProvider. On passe donc le contenu deja traduit en props.
  const content = {
    name: t("name"),
    role: t("role"),
    nationalityLabel: t("nationalityLabel"),
    nationalityValue: t("nationalityValue"),
    locationLabel: t("locationLabel"),
    locationValue: t("locationValue"),
    languagesLabel: t("languagesLabel"),
    languagesValue: t("languagesValue"),
    availabilityLabel: t("availabilityLabel"),
    availabilityValue: t("availabilityValue"),
  }

  return (
    <div className="fixed left-4 top-4 z-40 sm:left-6 sm:top-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t("close") : t("open")}
        aria-expanded={open}
        title={open ? t("close") : t("open")}
        className="flex size-11 cursor-pointer items-center justify-center rounded-2xl border border-border bg-card/90 text-foreground shadow-md backdrop-blur transition-transform hover:scale-105 active:scale-90"
      >
        <HookIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.85, y: -50 }}
            transition={{ duration: 0.25, ease: "easeIn" }}
            className="pointer-events-auto"
            style={{
              width: CANVAS_WIDTH_PX,
              height: CANVAS_HEIGHT_PX,
              maxWidth: "calc(100vw - 2rem)",
              maxHeight: "calc(100vh - 5rem)",
            }}
          >
            <Suspense fallback={null}>
              <LanyardScene content={content} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
