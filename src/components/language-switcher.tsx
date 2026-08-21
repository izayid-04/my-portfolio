"use client"

import { useLocale, useTranslations } from "next-intl"
import { FR, GB } from "country-flag-icons/react/3x2"
import { useRouter, usePathname } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface LanguageSwitcherProps {
  className?: string
  variant?: "dock" | "menu"
}

const locales: { value: Locale; flag: React.ComponentType<{ className?: string }> }[] = [
  { value: "fr", flag: FR },
  { value: "en", flag: GB },
]

export function LanguageSwitcher({ className, variant = "dock" }: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("languageSwitcher")

  const localeLabels: Record<Locale, string> = {
    fr: t("french"),
    en: t("english"),
  }

  const handleChange = (value: string) => {
    router.replace(pathname, { locale: value as Locale })
  }

  if (variant === "menu") {
    return (
      <div className="flex items-center gap-3 rounded-xl px-4 py-3">
        <span className="text-sm font-medium text-foreground">{t("label")}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {locales.map(({ value, flag: Flag }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleChange(value)}
              aria-label={localeLabels[value]}
              aria-pressed={locale === value}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                locale === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Flag className="size-4 rounded-[2px] object-cover" />
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="group relative flex flex-col items-center size-full">
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 border border-border shadow-sm hidden sm:block"
        aria-hidden
      >
        {t("label")}
      </span>
      <Select value={locale} onValueChange={handleChange}>
        <SelectTrigger
          size="sm"
          aria-label={t("label")}
          className={cn(
            "h-auto w-auto gap-1 border-none bg-transparent p-0 shadow-none text-foreground hover:text-foreground/80 hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='text-'])]:text-foreground",
            className
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="center">
          {locales.map(({ value, flag: Flag }) => (
            <SelectItem key={value} value={value} aria-label={localeLabels[value]}>
              <Flag className="size-4 rounded-[2px] object-cover" />
              {value.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
