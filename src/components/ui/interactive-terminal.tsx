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
      { text: "✔ Spécialités : Architectures Web scalables, APIs REST & UI/UX HD" },
      { text: "✔ Localisation : France / Remote" },
    ],
  },
  {
    cmd: "cat bio.md",
    outputs: [
      { text: "## Parcours & Philosophie", highlight: true },
      { text: "Après plusieurs années d'expérience en développement web, je m'attache à livrer des produits à la fois robustes techniquement et agréables à utiliser." },
      { text: "Mon approche combine la rigueur backend, la modernité des frameworks front-end modernes et une forte sensibilité DevOps." },
    ],
  },
  {
    cmd: "cat stack.config.ts",
    outputs: [
      { text: "export const techStack = {" },
      { text: '  backend: ["Laravel", "Spring Boot", "Nest.js", "Node.js / Express"],', highlight: true },
      { text: '  frontend: ["Next.js 15", "Angular", "React", "TailwindCSS", "Framer Motion"],', accent: true },
      { text: '  databases: ["PostgreSQL", "MySQL", "Prisma ORM", "Supabase"],' },
      { text: '  devops: ["Linux / Bash", "Docker & Compose", "CI/CD GitHub Actions", "VPS / Nginx"]' },
      { text: "}" },
    ],
  },
  {
    cmd: "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'",
    outputs: [
      { text: "NAMES                   STATUS                    PORTS", highlight: true },
      { text: "portfolio-nextjs-app   Up 14 hours (healthy)     0.0.0.0:3000->3000/tcp", accent: true },
      { text: "postgres-main-db        Up 14 hours (healthy)     0.0.0.0:5432->5432/tcp" },
      { text: "supabase-storage-api    Up 14 hours (healthy)     0.0.0.0:8000->8000/tcp" },
    ],
  },
  {
    cmd: "git log --oneline -n 4",
    outputs: [
      { text: "a1f8c92 (head -> main) feat: Visualiseur CV PDF & Canvas HD sans barre de scroll", highlight: true },
      { text: "8b3e210 style: Standardisation du design system & support mode sombre/clair" },
      { text: "4d9a102 feat: Refonte interactive du composant Terminal CLI" },
      { text: "1c2f009 init: Architecture initiale du portfolio v2.0", accent: true },
    ],
  },
  {
    cmd: "curl -s -X GET /api/certifications | jq '.'",
    outputs: [
      { text: "[" },
      { text: "  {", highlight: true },
      { text: '    "degree": "Licence 3 en Génie Logiciel",', accent: true },
      { text: '    "school": "Université Dakar-Bourguiba",', accent: true },
      { text: '    "year": "2025"', accent: true },
      { text: "  }" },
      { text: "]" },
    ],
  },
  {
    cmd: "status --availability",
    outputs: [
      { text: "● Statut : Ouvert aux projets, missions & opportunités de recrutement", highlight: true },
      { text: "● Mode : Freelance / CDI / Temps plein" },
      { text: "● Contact : via la page /contact ou par mail direct" },
    ],
  },
]

function PromptPrefix() {
  return (
    <div className="inline-flex items-center gap-0.5 font-mono font-bold shrink-0">
      <span className="text-primary">izayid</span>
      <span className="text-muted-foreground/50">@</span>
      <span className="text-emerald-500 dark:text-emerald-400">portfolio</span>
      <span className="text-muted-foreground/50">:</span>
      <span className="text-amber-500 dark:text-amber-400">~</span>
      <span className="text-emerald-500 dark:text-emerald-400 font-extrabold ml-0.5">$</span>
    </div>
  )
}

export function InteractiveTerminal() {
  const [lines, setLines] = useState<Array<{ type: "cmd" | "out"; text: string; highlight?: boolean; accent?: boolean }>>([])
  const [currentCmd, setCurrentCmd] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  // Défilement fluide automatique vers la fin du terminal à chaque frappe/nouvelle ligne
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [lines, currentCmd])

  // Exécution du scénario complet avec réponses détaillées et défilement fluide
  useEffect(() => {
    let active = true

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    // Helper d'accumulation des lignes sans effacement abrupt
    const appendLine = (line: { type: "cmd" | "out"; text: string; highlight?: boolean; accent?: boolean }) => {
      setLines((prev) => [...prev, line])
    }

    async function runLoop() {
      while (active) {
        setLines([])
        setCurrentCmd("")
        await sleep(500)

        for (const scenario of SCENARIOS) {
          if (!active) break

          // 1. Saisie caractère par caractère
          for (let i = 1; i <= scenario.cmd.length; i++) {
            if (!active) break
            setCurrentCmd(scenario.cmd.substring(0, i))
            await sleep(35)
          }

          if (!active) break
          await sleep(200)

          // Valider et ajouter la commande
          appendLine({ type: "cmd", text: scenario.cmd })
          setCurrentCmd("")

          // 2. Affichage progressif de la réponse complète et détaillée
          for (const out of scenario.outputs) {
            if (!active) break
            await sleep(180)
            appendLine({ type: "out", ...out })
          }

          await sleep(1000)
        }

        if (!active) break
        // Pause à la fin avant de réinitialiser la boucle
        await sleep(4000)
      }
    }

    runLoop()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="w-full h-[500px] sm:h-[540px] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden flex flex-col font-mono text-xs select-none">
      {/* Masquage de la barre de scroll tout en permettant le défilement automatique */}
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

      {/* EN-TÊTE DU TERMINAL AVEC PROMPT ÉMERAUDE/VERT */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/60 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
          <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
          <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <TerminalIcon className="size-3.5 text-emerald-500" />
          <PromptPrefix />
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Sparkles className="size-3 text-emerald-500" />
          <span>zsh</span>
        </div>
      </div>

      {/* CORPS DU TERMINAL AVEC TOUCHES VERTES ÉMERAUDE */}
      <div
        ref={containerRef}
        className="flex-1 p-4 sm:p-5 overflow-y-auto terminal-no-scrollbar space-y-2 bg-card"
      >
        {lines.map((line, idx) => (
          <div key={idx} className="leading-relaxed">
            {line.type === "cmd" ? (
              <div className="flex items-center gap-2 font-bold text-foreground mt-3 pt-1 border-t border-border/20">
                <PromptPrefix />
                <span className="text-foreground">{line.text}</span>
              </div>
            ) : (
              <div
                className={`pl-5 ${
                  line.accent
                    ? "text-emerald-500 dark:text-emerald-400 font-semibold"
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
          <div className="flex items-center gap-2 font-bold text-foreground mt-3">
            <PromptPrefix />
            <span className="text-foreground">{currentCmd}</span>
            <span className="animate-pulse bg-emerald-500 w-2 h-4 inline-block ml-0.5" />
          </div>
        )}
      </div>
    </div>
  )
}
