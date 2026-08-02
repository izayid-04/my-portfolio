"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type ContentStatus = "draft" | "published" | "archived"

interface StatusSelectProps {
  value: ContentStatus
  onChange: (value: ContentStatus) => void
  id?: string
}

export function StatusSelect({ value, onChange, id }: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as ContentStatus)}>
      <SelectTrigger id={id} className="w-[150px] rounded-lg bg-background">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        <SelectItem value="draft">Brouillon</SelectItem>
        <SelectItem value="published">Publie</SelectItem>
        <SelectItem value="archived">Archive</SelectItem>
      </SelectContent>
    </Select>
  )
}
