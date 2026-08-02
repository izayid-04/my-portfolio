"use client"

import React, { useState, useEffect, useRef } from "react"
import { Terminal as TerminalIcon, Sparkles } from "lucide-react"

interface ScenarioStep {
  cmd: string
  outputs: Array<{ text: string; highlight?: boolean; accent?: boolean }>
}

const SCENARIOS: ScenarioStep[] = [
  {
    cmd: "pnpm run fetch-profile",
    outputs: [
      { text: "⏳ Initialisation du profil développeur..." },
      { text: "✔ Nom : Izayid Ali", highlight: true },
      { text: "✔ Rôle : Développeur Full-Stack & DevOps", accent: true },
      { text: "✔ Spécialité : Architectures Web & Applications HD" },
    ],
  },
  {
    cmd: "cat stack.config.ts",
    outputs: [
      { text: "export const techStack = {" },
      { text: '  backend: ["Laravel", "Spring Boot", "Nest.js"],', highlight: true },
      { text: '  frontend: ["Next.js", "Angular", "React", "TailwindCSS"],', accent: true },
      { text: '  devops: ["Linux", "Docker", "CI/CD", "VPS & Cloud"]' },
      { text: "}" },
    ],
  },
  {
    cmd: "git log --oneline -n 3",
    outputs: [
      { text: "a1f8c92 (head -> main) feat: Visualiseur CV PDF & Canvas HD", highlight: true },
      { text: "8b3e210 style: Standardisation du design system & mode sombre" },
      { text: "4d9a102 init: Plateforme web portfolio v2.0", accent: true },
    ],
  },
  {
    cmd: "status --availability",
    outputs: [
      { text: "● Statut : Ouvert aux projets & opportunités ambitieuses", highlight: true },
      { text: "● Localisation : France / Remote" },
    ],
  },
]

export function InteractiveTerminal() {
  const [lines, setLines] = useState<Array<{ type: "cmd" | "out"; text: string; highlight?: boolean; accent?: boolean }>>([])
  const [currentCmd, setCurrentCmd] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll automatique imperceptible sans barre de scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines, currentCmd])

  // Boucle de frappe des commandes et affichage progressif
  useEffect(() => {
    let active = true

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    async function runLoop() {
      while (active) {
        setLines([])
        setCurrentCmd("")
        await sleep(600)

        for (const scenario of SCENARIOS) {
          if (!active) break

          // 1. Saisie caractère par caractère de la commande
          for (let i = 1; i <= scenario.cmd.length; i++) {
            if (!active) break
            setCurrentCmd(scenario.cmd.substring(0, i))
            await sleep(45)
          }

          if (!active) break
          await sleep(250)

          // Valider la commande saisie
          setLines((prev) => [...prev, { type: "cmd", text: scenario.cmd }])
          setCurrentCmd("")

          // 2. Affichage progressif des résultats de la commande
          for (const out of scenario.outputs) {
            if (!active) break
            await sleep(220)
            setLines((prev) => [...prev, { type: "out", ...out }])
          }

          await sleep(1400)
        }

        if (!active) break
        await sleep(2000)
      }
    }

    runLoop()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="w-full h-[360px] sm:h-[400px] rounded-2xl border border-border bg-card text-card-foreground shadow-xl overflow-hidden flex flex-col font-mono text-xs select-none">
      {/* Masquage strict de la barre de scroll */}
      <style jsx global>{`
        .terminal-no-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .terminal-no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* EN-TÊTE DU TERMINAL (Respecte les variables du thème) */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/60 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
          <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
          <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <TerminalIcon className="size-3.5 text-primary" />
          <span>izayid@portfolio:~</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Sparkles className="size-3 text-primary" />
          <span>En direct</span>
        </div>
      </div>

      {/* CORPS DU TERMINAL (SANS BARRE DE SCROLL) */}
      <div
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto terminal-no-scrollbar space-y-2 bg-card"
      >
        {lines.map((line, idx) => (
          <div key={idx} className="leading-relaxed">
            {line.type === "cmd" ? (
              <div className="flex items-center gap-2 font-bold text-foreground">
                <span className="text-primary font-semibold">izayid@portfolio:~$</span>
                <span>{line.text}</span>
              </div>
            ) : (
              <div
                className={`pl-4 ${
                  line.accent
                    ? "text-primary font-semibold"
                    : line.highlight
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {line.text}
              </div>
            )}
          </div>
        ))}

        {/* LIGNE EN COURS DE FRAPPE */}
        {currentCmd && (
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span className="text-primary font-semibold">izayid@portfolio:~$</span>
            <span>{currentCmd}</span>
            <span className="animate-pulse bg-primary w-2 h-4 inline-block" />
          </div>
        )}
      </div>
    </div>
  )
}
