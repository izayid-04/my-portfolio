import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { createClient } from "@supabase/supabase-js"

const prisma = new PrismaClient()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!supabaseServiceKey || supabaseServiceKey.endsWith("...")) {
  supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
}

const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets"

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables Supabase manquantes dans .env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function uploadImagesToSupabase() {
  console.log("🚀 Début du transfert des images d'articles vers Supabase Storage...")

  const posts = await prisma.blogPost.findMany({
    where: {
      image: { not: null },
    },
  })

  console.log(`📌 ${posts.length} articles avec des images à vérifier/uploader.`)

  for (const post of posts) {
    if (!post.image) continue

    // Si l'image est déjà stockée sur Supabase Storage, passer
    if (post.image.includes("supabase.co/storage/v1/object/public")) {
      console.log(`⏩ Article "${post.title}" a déjà une image Supabase Storage.`)
      continue
    }

    console.log(`⏳ Téléchargement de l'image pour "${post.title}" (${post.image})...`)

    try {
      const response = await fetch(post.image)
      if (!response.ok) {
        console.error(`❌ Échec du téléchargement pour "${post.title}": ${response.statusText}`)
        continue
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const contentType = response.headers.get("content-type") || "image/jpeg"

      const fileExt = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg"
      const filePath = `blogs/${post.slug}-${Date.now()}.${fileExt}`

      console.log(`📤 Envoi vers Supabase Storage bucket "${bucketName}" sous le nom "${filePath}"...`)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType,
          upsert: true,
        })

      if (uploadError) {
        console.error(`❌ Erreur Supabase Storage pour "${post.title}":`, uploadError.message)
        continue
      }

      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)
      const publicUrl = publicUrlData.publicUrl

      console.log(`✅ Image uploadée avec succès ! URL: ${publicUrl}`)

      // Mise à jour de l'article en DB
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { image: publicUrl },
      })

      console.log(`🎉 Article "${post.title}" mis à jour en base de données avec l'URL Supabase.`)
    } catch (err) {
      console.error(`❌ Erreur lors du traitement de "${post.title}":`, err)
    }
  }

  console.log("🏁 Transfert terminé !")
}

uploadImagesToSupabase()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
