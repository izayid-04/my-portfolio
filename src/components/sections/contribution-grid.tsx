"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import type { ContributionCalendar, ContributionDay } from "@/lib/github"

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
function getMonthLabels(weeks: { days: { date: string }[] }[], monthNames: string[]): (string | null)[] {
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
      labels.push(monthNames[month])
    } else {
      labels.push(null)
    }
  }
  return labels
}

function formatDate(date: string, locale: string) {
  return new Date(date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

interface ContributionGridProps {
  calendar: ContributionCalendar
}

const MOBILE_WEEKS_VISIBLE = 14

export function ContributionGrid({ calendar }: ContributionGridProps) {
  const locale = useLocale()
  const t = useTranslations("about")
  const monthNames = t.raw("months") as string[]
  const dayLabels = t.raw("days") as string[]
  const [selected, setSelected] = useState<ContributionDay | null>(null)
  const maxCount = Math.max(...calendar.weeks.flatMap((w) => w.days.map((d) => d.count)))

  function renderGrid(weeks: ContributionCalendar["weeks"]) {
    const monthLabels = getMonthLabels(weeks, monthNames)
    return (
      <div className="flex gap-2 min-w-max">
        <div className="flex shrink-0 flex-col gap-[3px] pt-[15px] text-[10px] leading-none text-muted-foreground">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-[11px] leading-[11px]">
              {label}
            </div>
          ))}
        </div>

        <div className="inline-flex flex-col gap-1">
          <div className="flex gap-[3px] text-[10px] leading-none text-muted-foreground">
            {weeks.map((_, i) => (
              <div key={i} className="w-[11px] shrink-0 text-left">
                {monthLabels[i] ?? ""}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.days.map((day) => (
                  <button
                    type="button"
                    key={day.date}
                    onClick={() => setSelected(day)}
                    title={t("contributionsOn", { count: day.count, date: formatDate(day.date, locale) })}
                    aria-label={t("contributionsOn", { count: day.count, date: formatDate(day.date, locale) })}
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
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="overflow-x-auto overflow-y-visible py-1 sm:hidden">
        {renderGrid(calendar.weeks.slice(-MOBILE_WEEKS_VISIBLE))}
      </div>
      <div className="hidden overflow-x-auto overflow-y-visible py-1 sm:block">
        {renderGrid(calendar.weeks)}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="min-h-[1em] text-xs text-muted-foreground">
          {selected
            ? t("contributionsOn", { count: selected.count, date: formatDate(selected.date, locale) })
            : t("githubClickHint")}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>{t("githubLess")}</span>
          {LEVEL_CLASSES.map((cls, i) => (
            <div key={i} className={`size-[11px] shrink-0 rounded-[2px] ${cls}`} />
          ))}
          <span>{t("githubMore")}</span>
        </div>
      </div>
    </div>
  )
}
