import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from "@prisma/client"
import * as dotenv from "dotenv"
import * as path from "path"
import * as fs from "fs"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets"

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
const prisma = new PrismaClient()

async function main() {
  const localLogoPath = "/home/iza/.gemini/antigravity/brain/159616a0-2a8c-4c3b-8681-6df78a4cb10b/udb_university_logo_1785599680163.png"
  
  if (!fs.existsSync(localLogoPath)) {
    console.error("Fichier logo local non trouvé")
    return
  }

  const fileBuffer = fs.readFileSync(localLogoPath)
  const storagePath = "institutions/udb-dakar-logo.png"

  console.log(`⬆️ Envoi du logo UDB haute définition vers Supabase Storage (${bucket}/${storagePath})...`)

  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, fileBuffer, {
    contentType: "image/png",
    upsert: true,
  })

  if (uploadError) {
    console.error("❌ Échec de l'upload Supabase:", uploadError.message)
    return
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath)
  const publicUrl = publicUrlData.publicUrl

  console.log(`✅ Logo uploadé sur Supabase Storage avec succès !`)
  console.log(`🔗 URL Publique Supabase: ${publicUrl}`)

  // Mise à jour du modèle Institution dans PostgreSQL via Prisma
  const updatedInst = await prisma.institution.update({
    where: { id: "udb-dakar" },
    data: { logo: publicUrl },
  })

  console.log(`🎉 Établissement "${updatedInst.name}" mis à jour en BDD PostgreSQL avec l'URL Supabase Storage !`)
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
