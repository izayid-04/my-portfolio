import { CARD_HEIGHT_PX, CARD_WIDTH_PX } from "./constants"

export interface BadgeCardContent {
  name: string
  role: string
  nationalityLabel: string
  nationalityValue: string
  locationLabel: string
  locationValue: string
  languagesLabel: string
  languagesValue: string
  availabilityLabel: string
  availabilityValue: string
}

/**
 * Visage de la carte d'identite suspendue au lanyard 3D. Purement presentationnel.
 * Recoit son contenu deja traduit en props : ce composant est rendu via drei <Html/>
 * a l'interieur du Canvas R3F, un arbre React separe qui n'a pas acces au contexte
 * NextIntlClientProvider du reste de l'app (d'ou l'appel a useTranslations en amont).
 *
 * Taille fixee en pixels CSS (CARD_WIDTH_PX / CARD_HEIGHT_PX) pour correspondre
 * exactement au collider physique de la carte (voir constants.ts) : sinon la zone
 * de glisser-deposer ne correspondrait pas a ce qui est visuellement affiche.
 */
export function BadgeCardFace({ content }: { content: BadgeCardContent }) {
  return (
    <div
      className="relative flex select-none flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      style={{ width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX }}
    >
      {/* Trou de fixation du lanyard */}
      <div className="absolute left-1/2 top-1.5 z-10 size-2.5 -translate-x-1/2 rounded-full border border-background bg-muted-foreground/40" />

      {/* Bandeau superieur colore */}
      <div className="h-9 shrink-0 bg-gradient-to-r from-primary/80 to-primary" />

      <div className="flex flex-1 flex-col items-center px-2.5 pb-2.5 pt-1">
        <div className="-mt-5 size-12 shrink-0 overflow-hidden rounded-lg border-[3px] border-card bg-muted shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element -- rendu dans un noeud DOM detache (drei Html), next/image n'y est pas fiable */}
          <img src="/me.png" alt="" width={48} height={48} className="size-full object-cover" />
        </div>

        <p className="mt-1 text-center text-[11px] font-bold leading-tight text-foreground">
          {content.name}
        </p>
        <p className="text-center text-[8px] leading-tight text-muted-foreground">{content.role}</p>

        <div className="mt-1.5 w-full space-y-1 border-t border-dashed border-border pt-1.5 text-[7px]">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-muted-foreground">{content.nationalityLabel}</span>
            <span className="font-semibold text-foreground">{content.nationalityValue}</span>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-muted-foreground">{content.locationLabel}</span>
            <span className="font-semibold text-foreground">{content.locationValue}</span>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-muted-foreground">{content.languagesLabel}</span>
            <span className="font-semibold text-foreground">{content.languagesValue}</span>
          </div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-muted-foreground">{content.availabilityLabel}</span>
            <span className="font-semibold text-foreground">{content.availabilityValue}</span>
          </div>
        </div>

        {/* Code-barre decoratif, pour le look "vrai badge" */}
        <div className="mt-auto flex h-4 w-full items-end gap-px pt-1.5 opacity-70">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="bg-foreground/70"
              style={{ width: 1.5, height: (i * 37) % 5 === 0 ? 14 : (i * 13) % 3 === 0 ? 7 : 11 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
