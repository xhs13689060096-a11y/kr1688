/**
 * KR1688 T04 — Demo Story Seed
 *
 * Inserts a single demo-only story (وادي الذئاب / 狼谷) into the Stories collection.
 * Run with: npx tsx src/seed/story-seed.ts
 *
 * Requires DATABASE_URL and PAYLOAD_SECRET env vars.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

async function seed() {
  const payload = await getPayload({ config })

  // Check if demo story already exists
  const existing = await payload.find({
    collection: 'stories',
    where: { demoOnly: { equals: true } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log('[seed] Demo story already exists, skipping. Slug:', existing.docs[0].slug)
    process.exit(0)
  }

  const story = await payload.create({
    collection: 'stories',
    data: {
      titleAr: 'وادي الذئاب',
      titleZh: '狼谷',
      slug: 'wadi-al-dhiab',
      synopsisAr: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'في أعماق الصحراء العربية، حيث تلتقي الأساطير بالواقع، تنطلق رحلة شاب يبحث عن الحقيقة وسط وادي تسكنه الذئاب. قصة مشوقة تمزج بين الغموض والمغامرة، وتكشف أسراراً مدفونة منذ قرون.',
                },
              ],
            },
          ],
        },
      },
      synopsisZh: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: '在阿拉伯沙漠深处，传说与现实交织，一个年轻人踏上寻找真相的旅程，穿越狼群栖息的峡谷。这部引人入胜的小说融合了悬疑与冒险，揭开埋藏了几个世纪的秘密。',
                },
              ],
            },
          ],
        },
      },
      tags: [{ tag: 'مغامرة' }, { tag: 'غموض' }, { tag: ' adventure ' }, { tag: ' mystery ' }],
      authorName: 'KR1688 Demo',
      genre: 'مغامرة وغموض',
      riskLevel: 'none',
      riskNotes: 'Demo seed data — no real content',
      contentStatus: 'draft',
      editorialStatus: 'drafting',
      rightsStatus: 'cleared',
      demoOnly: true,
    },
  })

  console.log('[seed] Demo story created:', story.slug, '(ID:', story.id, ')')
  process.exit(0)
}

seed().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
