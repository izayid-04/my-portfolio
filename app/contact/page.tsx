import Link from "next/link"
import { ArrowLeft, FileDown, Mail, MessageCircle } from "lucide-react"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata = {
  title: "Contact | Mon portfolio",
  description: "Me contacter pour un projet ou une collaboration.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Retour à l'accueil
        </Link>
        <header className="mb-12">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Contact
          </h1>
          <p className="mt-3 text-sm font-medium bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent sm:text-lg">
            Un projet, une question ou une collaboration ? Envoyez-moi un message.
          </p>
        </header>
        <div className="space-y-10">
          <Link
            href="/cv"
            className="flex items-center justify-between gap-4 rounded-xl border border-primary/25 bg-primary/5 p-4 shadow-sm transition-colors hover:bg-primary/10 sm:p-5"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">Curriculum vitae</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Consultez mon CV et téléchargez-le en PDF directement depuis la page.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <FileDown className="size-4" aria-hidden />
              Ouvrir
            </span>
          </Link>
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="sr-only">Coordonnées</h2>
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
                    Email
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
                    WhatsApp
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
              Formulaire de contact
            </h2>
            <ContactForm />
          </section>
        </div>
      </div>
    </div>
  )
}
