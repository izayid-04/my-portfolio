"use client"

import { useState } from "react"
import type { ContributionCalendar, ContributionDay } from "@/lib/github"

const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
]

/** GitHub : weekday 0 = dimanche, 1 = lundi, ... 6 = samedi. */
const DAY_LABELS = ["", "Lun", "", "Mer", "", "Ven", ""]

function levelFor(count: number, max: number) {
  if (count === 0) return 0
  if (max <= 0) return 1
  const ratio = count / max
  if (ratio > 0.75) return 4
  if (ratio > 0.5) return 3
  if (ratio > 0.25) return 2
  return 1
}

const LEVEL_CLASSES = [
  "bg-muted",
  "bg-[#9be9a8] dark:bg-[#0e4429]",
  "bg-[#40c463] dark:bg-[#006d32]",
  "bg-[#30a14e] dark:bg-[#26a641]",
  "bg-[#216e39] dark:bg-[#39d353]",
]

/** Étiquette de mois affichée au-dessus de la première semaine où ce mois commence. */
function getMonthLabels(weeks: { days: { date: string }[] }[]): (string | null)[] {
  let lastMonth = -1
  const labels: (string | null)[] = []
  for (const week of weeks) {
    const firstDay = week.days[0]
    if (!firstDay) {
      labels.push(null)
      continue
    }
    const month = new Date(firstDay.date).getMonth()
    if (month !== lastMonth) {
      lastMonth = month
      labels.push(MONTH_LABELS[month])
    } else {
      labels.push(null)
    }
  }
  return labels
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

interface ContributionGridProps {
  calendar: ContributionCalendar
}

export function ContributionGrid({ calendar }: ContributionGridProps) {
  const [selected, setSelected] = useState<ContributionDay | null>(null)
  const maxCount = Math.max(...calendar.weeks.flatMap((w) => w.days.map((d) => d.count)))
  const monthLabels = getMonthLabels(calendar.weeks)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="overflow-x-auto overflow-y-visible py-1">
        <div className="flex gap-2 min-w-max">
          <div className="flex shrink-0 flex-col gap-[3px] pt-[15px] text-[10px] leading-none text-muted-foreground">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-[11px] leading-[11px]">
                {label}
              </div>
            ))}
          </div>

          <div className="inline-flex flex-col gap-1">
            <div className="flex gap-[3px] text-[10px] leading-none text-muted-foreground">
              {calendar.weeks.map((_, i) => (
                <div key={i} className="w-[11px] shrink-0 text-left">
                  {monthLabels[i] ?? ""}
                </div>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {calendar.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.days.map((day) => (
                    <button
                      type="button"
                      key={day.date}
                      onClick={() => setSelected(day)}
                      title={`${day.count} contribution${day.count > 1 ? "s" : ""} le ${formatDate(day.date)}`}
                      aria-label={`${day.count} contribution${day.count > 1 ? "s" : ""} le ${formatDate(day.date)}`}
                      className={`size-[11px] shrink-0 cursor-pointer rounded-[2px] transition-transform hover:scale-125 ${LEVEL_CLASSES[levelFor(day.count, maxCount)]} ${
                        selected?.date === day.date
                          ? "ring-2 ring-foreground ring-offset-1 ring-offset-card"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="min-h-[1em] text-xs text-muted-foreground">
          {selected
            ? `${selected.count} contribution${selected.count > 1 ? "s" : ""} le ${formatDate(selected.date)}`
            : "Clique sur une case pour voir le détail"}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Moins</span>
          {LEVEL_CLASSES.map((cls, i) => (
            <div key={i} className={`size-[11px] shrink-0 rounded-[2px] ${cls}`} />
          ))}
          <span>Plus</span>
        </div>
      </div>
    </div>
  )
}
