import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY
const MISTRAL_API_URL = process.env.MISTRAL_API_URL ?? "https://api.mistral.ai/v1/chat/completions"
const MISTRAL_MODEL = process.env.MISTRAL_MODEL ?? "mistral-small-latest"

if (!MISTRAL_API_KEY) {
  throw new Error("MISTRAL_API_KEY manquante dans l'environnement.")
}

const FIELD_INSTRUCTIONS = {
  title: "This is a short blog post title. Keep it concise and natural, matching the tone of a professional developer portfolio. Do NOT translate proper nouns / brand names (project names like TMCO, YEE YÔ, BonjourCitoyen, PhotoNum, BIACode, EASYTECS, UDB, Nora, Compryo, PassMaker stay unchanged).",
  excerpt: "This is a short blog post excerpt/summary. Keep it concise. Do NOT translate proper nouns / brand names.",
  content: "This is the full body of a blog post, written in Markdown with ## headings and possibly code blocks. Preserve the Markdown structure, headings, code blocks and formatting exactly — only translate the natural-language text. Do NOT translate proper nouns / brand names / project names.",
}

async function translate(text, kind) {
  const trimmed = text.trim()
  if (!trimmed) return ""

  const systemPrompt = `You are a professional French-to-English translator working on a software developer's portfolio website. Translate the given French text to natural, professional English. ${FIELD_INSTRUCTIONS[kind]} Respond with ONLY the translated text, no explanations, no quotes around it, no markdown formatting characters like ** or # unless they were already present in the source for structure.`

  const res = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: trimmed },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Mistral error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const translation = data?.choices?.[0]?.message?.content?.trim()
  if (!translation) throw new Error("Réponse vide de Mistral.")
  return translation
}

async function main() {
  console.log("=== Traduction des articles de blog ===")
  const posts = await prisma.blogPost.findMany({ where: { published: true } })
  for (const post of posts) {
    if (post.titleEn && post.excerptEn && post.contentEn) {
      console.log(`- ${post.title} : déjà traduit, ignoré.`)
      continue
    }
    console.log(`- ${post.title} : traduction en cours...`)
    const titleEn = post.titleEn || (await translate(post.title, "title"))
    const excerptEn = post.excerptEn || (await translate(post.excerpt, "excerpt"))
    const contentEn = post.contentEn || (await translate(post.content, "content"))
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { titleEn, excerptEn, contentEn },
    })
    console.log(`  -> "${titleEn}"`)
  }

  console.log("\nTerminé.")
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
