import { Github } from "lucide-react"
import Link from "next/link"
import { getTranslations, getLocale } from "next-intl/server"
import { getGithubContributions } from "@/lib/github"
import { ContributionGrid } from "./contribution-grid"

interface GithubContributionsProps {
  username: string
}

export async function GithubContributions({ username }: GithubContributionsProps) {
  const calendar = await getGithubContributions(username)
  if (!calendar || calendar.weeks.length === 0) return null

  const t = await getTranslations("about")
  const locale = await getLocale()

  return (
    <div className="mt-10 sm:mt-16">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl md:text-2xl">
            {t("githubTitle")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {calendar.totalContributions.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} {t("githubSubtitle")}
          </p>
        </div>
        <Link
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <Github className="size-3.5" />
          {t("githubProfile")}
        </Link>
      </div>

      <ContributionGrid calendar={calendar} />
    </div>
  )
}
