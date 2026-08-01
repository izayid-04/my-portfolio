import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from "@prisma/client"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets"

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Début du transfert des logos d'établissements vers Supabase Storage...")

  const institutions = await prisma.institution.findMany()

  for (const inst of institutions) {
    if (!inst.logo) continue

    if (inst.logo.includes("supabase.co")) {
      console.log(`⏩ [DÉJÀ SUR SUPABASE] ${inst.name}: ${inst.logo}`)
      continue
    }

    console.log(`⬇️ Téléchargement du logo pour ${inst.name}: ${inst.logo}`)
    try {
      const response = await fetch(inst.logo)
      if (!response.ok) {
        console.error(`❌ Échec du téléchargement pour ${inst.name}: ${response.statusText}`)
        continue
      }

      const blob = await response.arrayBuffer()
      const buffer = Buffer.from(blob)

      const fileName = `institutions/${inst.id}-logo.png`

      console.log(`⬆️ Envoi vers Supabase Storage bucket "${bucket}" path "${fileName}"...`)
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true,
      })

      if (uploadError) {
        console.error(`❌ Échec de l'upload Supabase pour ${inst.name}:`, uploadError.message)
        continue
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
      const publicUrl = publicUrlData.publicUrl

      console.log(`✅ Logo uploadé avec succès ! URL Supabase: ${publicUrl}`)

      // Mise à jour de la base de données
      await prisma.institution.update({
        where: { id: inst.id },
        data: { logo: publicUrl },
      })

      console.log(`🎉 Institution "${inst.name}" mise à jour en base de données avec l'URL Supabase !`)
    } catch (err) {
      console.error(`❌ Erreur pour ${inst.name}:`, err)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
