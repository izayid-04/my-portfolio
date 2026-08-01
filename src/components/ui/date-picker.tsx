"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"

interface DatePickerProps {
  value: string // Format YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Choisir une date", className = "" }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  // Parse la valeur actuelle ou prend la date du jour
  const parsedDate = React.useMemo(() => {
    if (!value) return new Date()
    const d = parseISO(value)
    return isValid(d) ? d : new Date()
  }, [value])

  const [currentMonth, setCurrentMonth] = React.useState<Date>(parsedDate)

  // Ferme le popover si clic à l'extérieur
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Génération des jours du mois
  const daysInMonth = React.useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7 // Lundi = 0
    const totalDays = new Date(year, month + 1, 0).getDate()

    const days: ({ day: number; date: Date; isCurrentMonth: boolean } | null)[] = []

    // Jours du mois précédent (remplissage)
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null)
    }

    // Jours du mois en cours
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d)
      days.push({ day: d, date, isCurrentMonth: true })
    }

    return days
  }, [currentMonth])

  const handleSelectDate = (date: Date) => {
    const formatted = format(date, "yyyy-MM-dd")
    onChange(formatted)
    setIsOpen(false)
  }

  const formattedDisplay = React.useMemo(() => {
    if (!value) return ""
    const d = parseISO(value)
    if (!isValid(d)) return value
    return format(d, "dd MMMM yyyy", { locale: fr })
  }, [value])

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const selectToday = () => {
    const today = new Date()
    handleSelectDate(today)
    setCurrentMonth(today)
  }

  return (
    <div className={`relative inline-block w-full ${className}`} ref={popoverRef}>
      {/* Bouton principal du DatePicker */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-left text-sm text-foreground shadow-sm hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
          {formattedDisplay ? (
            <span className="font-medium text-foreground capitalize">{formattedDisplay}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-muted"
            title="Effacer la date"
          >
            <X className="size-3.5" />
          </span>
        )}
      </button>

      {/* Popover Calendrier */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 z-[100] mt-1 w-[280px] rounded-xl border border-border bg-background p-3 text-popover-foreground shadow-2xl animate-in fade-in-50 zoom-in-95">
          {/* En-tête mois / navigation */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
            <button
              type="button"
              onClick={prevMonth}
              className="cursor-pointer rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs font-semibold capitalize text-foreground">
              {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="cursor-pointer rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground mb-1">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="size-8" />
              }

              const isSelected = value === format(item.date, "yyyy-MM-dd")
              const isToday = format(new Date(), "yyyy-MM-dd") === format(item.date, "yyyy-MM-dd")

              return (
                <button
                  key={item.date.toISOString()}
                  type="button"
                  onClick={() => handleSelectDate(item.date)}
                  className={`cursor-pointer size-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : isToday
                      ? "border border-primary/60 text-primary font-semibold hover:bg-primary/10"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {item.day}
                </button>
              )
            })}
          </div>

          {/* Raccourcis rapides en bas */}
          <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={selectToday}
              className="cursor-pointer text-xs font-medium text-primary hover:underline"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
