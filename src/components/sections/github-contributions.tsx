import { Github } from "lucide-react"
import Link from "next/link"
import { getGithubContributions } from "@/lib/github"

const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
]

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

interface GithubContributionsProps {
  username: string
}

export async function GithubContributions({ username }: GithubContributionsProps) {
  const calendar = await getGithubContributions(username)
  if (!calendar || calendar.weeks.length === 0) return null

  const maxCount = Math.max(...calendar.weeks.flatMap((w) => w.days.map((d) => d.count)))
  const monthLabels = getMonthLabels(calendar.weeks)

  return (
    <div className="mt-10 sm:mt-16">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl md:text-2xl">
            Activité GitHub
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {calendar.totalContributions.toLocaleString("fr-FR")} contributions sur les 12 derniers mois
          </p>
        </div>
        <Link
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <Github className="size-3.5" />
          Voir le profil
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="inline-flex flex-col gap-1 min-w-max">
          <div className="flex gap-[3px] pl-0 text-[10px] text-muted-foreground">
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
                  <div
                    key={day.date}
                    title={`${day.count} contribution${day.count > 1 ? "s" : ""} le ${new Date(day.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
                    className={`size-[11px] shrink-0 rounded-[2px] ${LEVEL_CLASSES[levelFor(day.count, maxCount)]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
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
