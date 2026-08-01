"use client"

import { usePathname } from "next/navigation"
import { Chatbot } from "@/components/chat/chatbot"
import { Navbar } from "@/components/navbar"

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <div className="relative min-h-screen">
      {/* Background ambient gradient glows matching Hero colors */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/15 blur-[120px] hero-float opacity-70" />
        <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-violet-500/15 blur-[120px] hero-float opacity-70" />
        <div className="absolute left-1/3 bottom-10 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[120px] hero-float opacity-70" />
      </div>

      <div className="relative z-10">{children}</div>
      {!isAdminRoute && <Chatbot />}
      {!isAdminRoute && <Navbar />}
    </div>
  )
}
