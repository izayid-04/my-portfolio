"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { Send, Search } from "lucide-react"
import { countryPhoneOptions, getFlagEmoji, getPhonePlaceholder } from "@/data/countries"
import {
  TurnstileWidget,
  isTurnstileEnabled,
  type TurnstileWidgetHandle,
} from "@/components/shared/turnstile-widget"
import { ContactConfirmationModal } from "./contact-confirmation-modal"
import type { ContactFormData } from "@/types"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const initialForm: ContactFormData = {
  name: "",
  email: "",
  countryCode: "SN",
  phone: "",
  message: "",
}

function filterCountries(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return countryPhoneOptions
  return countryPhoneOptions.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.includes(query.trim())
  )
}

export function ContactForm() {
  const t = useTranslations("contact")
  const [form, setForm] = useState<ContactFormData>(initialForm)
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [captchaHint, setCaptchaHint] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [selectOpen, setSelectOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)
  const captchaEnabled = isTurnstileEnabled()

  const phonePlaceholder = getPhonePlaceholder(form.countryCode)
  const filteredCountries = useMemo(
    () => filterCountries(countrySearch),
    [countrySearch]
  )

  // Ne pas focus le champ recherche à l'ouverture : sur mobile ça ouvre le clavier
  // et le redimensionnement ferme le select. L'utilisateur peut taper dans la recherche s'il veut.
  useEffect(() => {
    if (selectOpen) setCountrySearch("")
  }, [selectOpen])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = (value: string) => {
    setForm((prev) => ({ ...prev, countryCode: value }))
    setSelectOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (captchaEnabled && !turnstileToken) {
      setCaptchaHint(true)
      return
    }
    setCaptchaHint(false)
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          message: form.message || undefined,
          countryCode: form.countryCode || undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      })
      await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        turnstileRef.current?.reset()
        return
      }
      setStatus("success")
      setForm(initialForm)
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } catch {
      setStatus("error")
      turnstileRef.current?.reset()
    }
  }

  const closeConfirmation = () => setStatus("idle")

  const selectedCountry = countryPhoneOptions.find((c) => c.code === form.countryCode)

  return (
    <>
      <style jsx global>{`
        .contact-country-select::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .contact-country-select {
          scrollbar-width: none !important;
        }
      `}</style>
      <ContactConfirmationModal
        open={status === "success"}
        onClose={closeConfirmation}
      />
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="contact-name"
            className="text-sm font-medium text-foreground"
          >
            {t("name")}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder={t("namePlaceholder")}
            className={cn(
              "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "transition-shadow"
            )}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="contact-email"
            className="text-sm font-medium text-foreground"
          >
            {t("email")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder={t("emailPlaceholder")}
            className={cn(
              "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "transition-shadow"
            )}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="contact-country"
            className="text-sm font-medium text-foreground"
          >
            {t("country")}
          </label>
          <Select
            value={form.countryCode}
            onValueChange={handleCountryChange}
            open={selectOpen}
            onOpenChange={setSelectOpen}
          >
            <SelectTrigger
              id="contact-country"
              className="w-full rounded-lg h-10 px-3 text-sm"
            >
              <SelectValue>
                {selectedCountry && (
                  <span className="flex items-center gap-2">
                    <span>{getFlagEmoji(selectedCountry.code)}</span>
                    <span>{selectedCountry.name}</span>
                    <span className="text-muted-foreground">({selectedCountry.dialCode})</span>
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              className="max-h-[min(320px,70vh)] contact-country-select"
              position="popper"
            >
              {/* Champ recherche masqué sur mobile : le focus ouvre le clavier et ferme le select */}
              <div
                className="sticky top-0 z-10 hidden border-b border-border bg-popover p-2 sm:block"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t("countrySearchPlaceholder")}
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className={cn(
                      "w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm text-foreground",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                    )}
                  />
                </div>
              </div>
              <div className="p-1">
                {filteredCountries.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {t("noCountryFound")}
                  </div>
                ) : (
                  filteredCountries.map((c) => (
                    <SelectItem
                      key={c.code}
                      value={c.code}
                      className="flex items-center gap-2 py-2"
                    >
                      <span>{getFlagEmoji(c.code)}</span>
                      <span>{c.name}</span>
                      <span className="text-muted-foreground">({c.dialCode})</span>
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="contact-phone"
            className="text-sm font-medium text-foreground"
          >
            {t("phone")}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder={phonePlaceholder}
            className={cn(
              "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "transition-shadow"
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="contact-message"
          className="text-sm font-medium text-foreground"
        >
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder={t("messagePlaceholder")}
          className={cn(
            "w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "transition-shadow min-h-[120px]"
          )}
        />
      </div>

      {captchaEnabled && (
        <div className="space-y-2">
          <TurnstileWidget
            ref={turnstileRef}
            onChange={(t) => {
              setTurnstileToken(t)
              if (t) setCaptchaHint(false)
            }}
          />
          {captchaHint && (
            <p className="text-sm text-destructive">
              {t("captchaHint")}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {t("disclaimer")}
        </p>
        <motion.button
          type="submit"
          disabled={status === "sending" || (captchaEnabled && !turnstileToken)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground",
            "shadow-sm transition-all hover:bg-primary/90 hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-60",
            "cursor-pointer"
          )}
        >
          {status === "sending" ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              {t("sending")}
            </>
          ) : status === "success" ? (
            t("sent")
          ) : (
            <>
              {t("send")}
              <Send className="size-4" />
            </>
          )}
        </motion.button>
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive">
          {t("errorMessage")}
        </p>
      )}
    </motion.form>
    </>
  )
}
