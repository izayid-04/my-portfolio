import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const folderRaw = formData.get("folder")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 })
    }

    const isImage = file.type.startsWith("image/")
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf")

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: "Seuls les images et fichiers PDF sont acceptés." }, { status: 400 })
    }

    const folder = typeof folderRaw === "string" && folderRaw.trim() ? folderRaw.trim() : "general"
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets"

    const supabase = createServerSupabaseClient()
    const bytes = await file.arrayBuffer()
    const safeName = sanitizeFileName(file.name || "image-upload")
    const path = `admin/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, Buffer.from(bytes), {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        {
          error: `Upload Supabase echoue: ${uploadError.message}`,
        },
        { status: 500 }
      )
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return NextResponse.json({
      url: data.publicUrl,
      path,
      bucket,
    })
  } catch {
    return NextResponse.json(
      {
        error:
          "Impossible d'uploader pour le moment. Verifie SUPABASE env + bucket storage.",
      },
      { status: 500 }
    )
  }
}
