export interface ContributionDay {
  date: string
  count: number
  weekday: number
}

export interface ContributionWeek {
  days: ContributionDay[]
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              weekday
            }
          }
        }
      }
    }
  }
`

/**
 * Récupère le calendrier de contributions GitHub (les "carrés verts") via l'API GraphQL.
 * Nécessite GITHUB_TOKEN (scope `read:user` suffisant) — jamais exposé au client.
 */
export async function getGithubContributions(
  login: string
): Promise<ContributionCalendar | null> {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.warn("[github] GITHUB_TOKEN manquant — calendrier de contributions ignoré")
    return null
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.error("[github] Erreur HTTP:", res.status)
      return null
    }

    const json = await res.json()
    if (json.errors) {
      console.error("[github] Erreur GraphQL:", json.errors)
      return null
    }

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar
    if (!calendar) return null

    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks.map((w: { contributionDays: Array<{ contributionCount: number; date: string; weekday: number }> }) => ({
        days: w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          weekday: d.weekday,
        })),
      })),
    }
  } catch (error) {
    console.error("[github] Erreur de récupération des contributions:", error)
    return null
  }
}
