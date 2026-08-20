// Run: npx tsx scripts/backfill-search.ts
// Backfills post_search and post_embedding for all existing posts

import postgres from 'postgres'
import { createHash } from 'node:crypto'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')

const sql = postgres(DATABASE_URL)

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/[*_]{1,3}(.+?)[*_]{1,3}/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .replace(/\|/g, ' ')
    .replace(/^[-: ]+$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function computeHash(title: string, content: string): string {
  return createHash('sha256').update(title + '\n' + content).digest('hex')
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OPENAI_BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 768,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${error}`)
  }

  const data = await response.json() as { data: { embedding: number[] }[] }
  return data.data[0].embedding
}

async function main() {
  const posts = await sql`SELECT id, title, content, content_hash FROM post`
  console.log(`Found ${posts.length} posts`)

  let searchCount = 0
  let embeddingCount = 0
  let embeddingSkipped = 0

  for (const p of posts) {
    const hash = computeHash(p.title, p.content)
    const searchText = stripMarkdown(p.title + '\n' + p.content)

    // Upsert post_search
    await sql`
      INSERT INTO post_search (post_id, search_text)
      VALUES (${p.id}, ${searchText})
      ON CONFLICT (post_id) DO UPDATE SET search_text = ${searchText}
    `
    searchCount++

    // Update content_hash
    if (p.content_hash !== hash) {
      await sql`UPDATE post SET content_hash = ${hash} WHERE id = ${p.id}`
    }

    // Generate embedding if API key available
    if (OPENAI_API_KEY) {
      const existing = await sql`
        SELECT content_hash, model FROM post_embedding WHERE post_id = ${p.id}
      `
      if (existing.length > 0 && existing[0].content_hash === hash && existing[0].model === 'text-embedding-3-large') {
        embeddingSkipped++
        console.log(`  [skip] ${p.id} - ${p.title.slice(0, 40)}`)
        continue
      }

      try {
        // Rate limit: wait 500ms between API calls
        await new Promise(resolve => setTimeout(resolve, 500))
        const embedding = await generateEmbedding(searchText)
        const vectorStr = `[${embedding.join(',')}]`
        await sql`
          INSERT INTO post_embedding (post_id, embedding, model, content_hash)
          VALUES (${p.id}, ${vectorStr}::vector, 'text-embedding-3-large', ${hash})
          ON CONFLICT (post_id) DO UPDATE SET
            embedding = ${vectorStr}::vector,
            model = 'text-embedding-3-large',
            content_hash = ${hash},
            created_at = NOW()
        `
        embeddingCount++
        console.log(`  [embed] ${p.id} - ${p.title.slice(0, 40)}`)
      } catch (err) {
        console.error(`  [fail] ${p.id}: ${err}`)
      }
    }
  }

  console.log(`\nDone:`)
  console.log(`  search_text: ${searchCount} upserted`)
  console.log(`  embedding: ${embeddingCount} generated, ${embeddingSkipped} skipped`)

  await sql.end()
}

main().catch(console.error)
