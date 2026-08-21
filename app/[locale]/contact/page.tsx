import { ArrowLeft, FileDown, Mail, MessageCircle } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { ContactForm } from "@/components/contact/contact-form"

export async function generateMetadata() {
  const t = await getTranslations("contact")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function ContactPage() {
  const t = await getTranslations("contact")

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("backHome")}
        </Link>
        <header className="mb-12">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm font-medium text-foreground sm:text-lg">
            {t("intro")}
          </p>
        </header>
        <div className="space-y-10">
          <Link
            href="/cv"
            className="flex items-center justify-between gap-4 rounded-xl border border-primary/25 bg-primary/5 p-4 shadow-sm transition-colors hover:bg-primary/10 sm:p-5"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{t("cvTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("cvDescription")}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <FileDown className="size-4" aria-hidden />
              {t("cvOpen")}
            </span>
          </Link>
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="sr-only">{t("coordinates")}</h2>
            <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
              <li className="flex items-center gap-3 text-muted-foreground">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md ring-2 ring-primary/25 [&_svg]:stroke-[2.25]"
                  aria-hidden
                >
                  <Mail className="size-5 shrink-0 text-primary-foreground" aria-hidden />
                </span>
                <div>
                  <span className="block text-sm font-medium text-foreground">
                    {t("email")}
                  </span>
                  <a
                    href="mailto:izayidali@biacode.tech"
                    className="text-sm hover:underline"
                  >
                    izayidali@biacode.tech
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md ring-2 ring-primary/25 [&_svg]:stroke-[2.25]"
                  aria-hidden
                >
                  <MessageCircle className="size-5 shrink-0 text-primary-foreground" aria-hidden />
                </span>
                <div>
                  <span className="block text-sm font-medium text-foreground">
                    {t("whatsapp")}
                  </span>
                  <a
                    href="https://wa.me/221783723507"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    +221 78 372 35 07
                  </a>
                </div>
              </li>
            </ul>
          </section>
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              {t("formTitle")}
            </h2>
            <ContactForm />
          </section>
        </div>
      </div>
    </div>
  )
}
