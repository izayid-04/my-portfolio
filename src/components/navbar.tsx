"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Github,
  Linkedin,
  Home,
  FileText,
  IdCard,
  Mail,
  PanelBottomOpen,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Dock, DockIcon } from "@/components/ui/dock"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { cn } from "@/lib/utils"

const pageLinks = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/blog", label: "Blog", icon: FileText },
  { href: "/cv", label: "CV", icon: IdCard },
  { href: "/contact", label: "Contact", icon: Mail },
]

const socialLinks = [
  { href: "https://github.com/izayid-04", label: "GitHub", icon: Github },
  { href: "https://www.linkedin.com/in/ali-izayid/", label: "LinkedIn", icon: Linkedin },
  {
    href: "https://x.com/Izayid04",
    label: "X",
    svgPath:
      "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    href: "https://discord.com",
    label: "Discord (iza06467)",
    svgPath:
      "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C2.427 6.006 2 8.6 2 11.274a18.995 18.995 0 0 0 5.367 13.494.078.078 0 0 0 .084.028 14.09 14.09 0 0 0 1.226-.594.075.075 0 0 0 .041-.056 16.83 16.83 0 0 1 .456-1.359.074.074 0 0 0-.041-.096 18.64 18.64 0 0 1-2.539-1.2.077.077 0 0 1-.008-.128 10.15 10.15 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 18.098 18.098 0 0 1-2.537 1.2.074.074 0 0 0-.041.096c.15.435.309.88.456 1.359a.075.075 0 0 0 .041.055 14.08 14.08 0 0 0 1.227.594.078.078 0 0 0 .084-.028A19 19 0 0 0 22 11.274c0-2.682-.428-5.275-1.291-6.876a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
  },
]

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handler = () => setIsMobile(mq.matches)
    handler()
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [breakpoint])
  return isMobile
}

function DockItem({
  href,
  label,
  icon,
  external,
  isActive,
}: {
  href: string
  label: string
  icon: React.ReactNode
  external?: boolean
  isActive?: boolean
}) {
  const content = (
    <div className="group relative flex flex-col items-center size-full">
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 border border-border shadow-sm hidden sm:block"
        aria-hidden
      >
        {label}
      </span>
      <span
        className={cn(
          "flex items-center justify-center size-full text-foreground transition-colors",
          isActive ? "text-foreground" : "hover:text-foreground/80"
        )}
      >
        {icon}
      </span>
    </div>
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="flex items-center justify-center size-full"
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} aria-label={label} className="flex items-center justify-center size-full">
      {content}
    </Link>
  )
}

function SvgIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const iconSize = 36
  const iconClassName = "size-5"

  return (
    <>
      {/* Mobile: bouton menu en haut à droite (z-40 pour passer derrière le chatbot) */}
      <div className="fixed top-0 right-0 z-40 p-3 sm:p-4 sm:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex size-11 items-center justify-center rounded-xl border border-border bg-background/95 backdrop-blur shadow-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" /> : <PanelBottomOpen className="size-5" />}
        </button>
      </div>

      {/* Mobile: panneau menu en haut (sous le bouton) */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-16 left-4 right-4 z-40 rounded-2xl border border-border bg-card shadow-xl p-4 sm:hidden"
            >
              <nav className="flex flex-col gap-1" aria-label="Navigation mobile">
                {pageLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      pathname === href || (href !== "/" && pathname.startsWith(href))
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {label}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border" />
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {"icon" in link && link.icon ? (
                      <link.icon className="size-5 shrink-0" />
                    ) : (
                      <SvgIcon path={(link as { svgPath: string }).svgPath} className="size-5 shrink-0" />
                    )}
                    {link.label}
                  </a>
                ))}
                <div className="my-2 h-px bg-border" />
                <div className="flex items-center gap-3 rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-foreground">Thème</span>
                  <AnimatedThemeToggler
                    aria-label="Mode clair / sombre"
                    className="ml-auto cursor-pointer [&_svg]:size-5"
                  />
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: Dock en bas */}
      <nav
        className="hidden sm:flex fixed bottom-0 left-0 right-0 z-50 justify-center pb-2 sm:pb-4 px-2"
        aria-label="Navigation"
      >
        <Dock
          direction="bottom"
          className="h-14 gap-3 px-4"
          iconSize={iconSize}
          iconMagnification={48}
          disableMagnification={false}
          iconDistance={80}
        >
          {pageLinks.map(({ href, label, icon: Icon }) => (
            <DockIcon key={label}>
              <DockItem
                href={href}
                label={label}
                icon={<Icon className={iconClassName} />}
                isActive={pathname === href || (href !== "/" && pathname.startsWith(href))}
              />
            </DockIcon>
          ))}
          <div className="mx-1 w-px self-stretch bg-border shrink-0" aria-hidden />
          {socialLinks.map((link) => (
            <DockIcon key={link.label}>
              <DockItem
                href={link.href}
                label={link.label}
                icon={
                  "icon" in link && link.icon ? (
                    <link.icon className={iconClassName} />
                  ) : (
                    <SvgIcon path={(link as { svgPath: string }).svgPath} className={iconClassName} />
                  )
                }
                external
              />
            </DockIcon>
          ))}
          <div className="mx-1 w-px self-stretch bg-border shrink-0" aria-hidden />
          <DockIcon>
            <div className="group relative flex flex-col items-center size-full">
              <span
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 border border-border shadow-sm"
                aria-hidden
              >
                Thème
              </span>
              <AnimatedThemeToggler
                aria-label="Mode clair / sombre"
                className="text-foreground hover:text-foreground/80 transition-colors flex items-center justify-center size-full cursor-pointer [&_svg]:size-5"
              />
            </div>
          </DockIcon>
        </Dock>
      </nav>
    </>
  )
}
