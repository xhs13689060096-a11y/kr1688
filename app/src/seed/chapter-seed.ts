/**
 * KR1688 T05 — Demo Chapter Seed
 *
 * Inserts two demo-only chapters linked to the demo story (وادي الذئاب / 狼谷).
 * Run with: npx tsx src/seed/chapter-seed.ts
 *
 * Requires DATABASE_URL and PAYLOAD_SECRET env vars.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

async function seed() {
  const payload = await getPayload({ config })

  // Find the demo story by slug
  const storyResult = await payload.find({
    collection: 'stories',
    where: { slug: { equals: 'wadi-al-dhiab' } },
    limit: 1,
  })

  if (storyResult.docs.length === 0) {
    console.error(
      '[chapter-seed] Demo story not found. Run story-seed.ts first.',
    )
    process.exit(1)
  }

  const story = storyResult.docs[0]
  console.log('[chapter-seed] Found demo story:', story.slug, '(ID:', story.id, ')')

  // Check if demo chapters already exist
  const existing = await payload.find({
    collection: 'chapters',
    where: { demoOnly: { equals: true } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log(
      '[chapter-seed] Demo chapters already exist, skipping. Count:',
      existing.totalDocs,
    )
    process.exit(0)
  }

  // --- Chapter 1 ---
  const chapter1 = await payload.create({
    collection: 'chapters',
    data: {
      titleAr: 'الفصل الأول: بداية الرحلة',
      titleZh: '第一章：旅程开始',
      slug: 'al-fasl-al-awwal-bidayat-al-rihla',
      chapterNumber: 1,
      story: story.id,
      bodyAr: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'كانت الشمس تغرب خلف الكثبان الرملية الذهبية، تاركةً وراءها سماءً ملتهبة بألوان الأرجوان والبرتقال. وقف سامر على حافة الوادي، يتأمل المشهد الذي طالما حلم به. كان الهواء جافاً، يحمل معه رائحة الرمال القديمة وعطر النباتات الصحراوية النادرة.',
                },
              ],
            },
          ],
        },
      },
      bodyZh: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: '太阳缓缓沉落在金色沙丘之后，天空被染成了紫橙交织的颜色。萨米尔站在峡谷边缘，凝望着这片他梦寐已久的土地。干燥的风吹过，带着远古沙粒的气息和稀有沙漠植物的芬芳。',
                },
              ],
            },
          ],
        },
      },
      status: 'published',
      wordCount: 0,
      demoOnly: true,
    },
  })

  console.log('[chapter-seed] Chapter 1 created:', chapter1.slug, '(ID:', chapter1.id, ')')

  // --- Chapter 2 ---
  const chapter2 = await payload.create({
    collection: 'chapters',
    data: {
      titleAr: 'الفصل الثاني: سر الوادي',
      titleZh: '第二章：山谷的秘密',
      slug: 'al-fasl-al-thani-sirr-al-wadi',
      chapterNumber: 2,
      story: story.id,
      bodyAr: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'في صباح اليوم التالي، استيقظ سامر على صوت عواء الذئاب البعيد. كان الصوت يحمل نغمة غريبة، وكأنه نداء قديم من أعماق الزمن. نهض بسرعة، وجمع أدواته القليلة، وبدأ في النزول إلى عمق الوادي. كانت الصخور تحيط به من كل جانب، منحوتة بأشكال عجيبة كأنها حكايات محفورة في الحجر.',
                },
              ],
            },
          ],
        },
      },
      bodyZh: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: '第二天清晨，萨米尔被远处狼嚎声唤醒。那声音带着奇特的调子，仿佛来自时间深处的呼唤。他迅速起身，收拾好为数不多的工具，开始向峡谷深处走去。四周的岩石形态奇异，仿佛铭刻在石头上的古老故事。',
                },
              ],
            },
          ],
        },
      },
      status: 'published',
      wordCount: 0,
      demoOnly: true,
    },
  })

  console.log('[chapter-seed] Chapter 2 created:', chapter2.slug, '(ID:', chapter2.id, ')')
  console.log('[chapter-seed] Done. 2 demo chapters seeded.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('[chapter-seed] Failed:', err)
  process.exit(1)
})
