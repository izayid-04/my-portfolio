import type { Metadata } from "next"
import { CvView } from "@/components/cv/cv-view"
import "./cv-print.css"

export const metadata: Metadata = {
  title: "CV | Izayid Ali",
  description:
    "Curriculum vitae — développeur full-stack orienté backend & DevOps, co-fondateur BIACode. Téléchargement PDF.",
}

export default function CvPage() {
  return <CvView />
}
