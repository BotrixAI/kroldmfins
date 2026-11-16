import 'server-only'
import { unstable_cache, revalidatePath, revalidateTag } from 'next/cache'
import { createQueue, readJsonDocument, writeJsonDocument } from '../blog/jsonStore'
import { DEFAULT_CONTENT } from './defaults'
import { cleanContent, withDefaults } from './schema'

// The figures edited in the Site data portal, kept as one JSON document next to the blog
// posts (see blog/jsonStore.js). Until the first save the site shows DEFAULT_CONTENT.
export const CONTENT_TAG = 'site-content'
const DOC_NAME = 'site-content.json'

export async function loadSiteContent() {
  const doc = await readJsonDocument(DOC_NAME)
  return {
    content: withDefaults(doc?.content, DEFAULT_CONTENT),
    updatedAt: doc?.updatedAt ?? null,
    updatedBy: doc?.updatedBy ?? null,
  }
}

// The public site reads through Next's data cache; every save clears it. If the store can't
// be reached, the pages still render with the built-in figures rather than failing.
export const getSiteContent = unstable_cache(
  async () => {
    try {
      return (await loadSiteContent()).content
    } catch (err) {
      console.error('[site-content]', err)
      return DEFAULT_CONTENT
    }
  },
  ['site-content'],
  { tags: [CONTENT_TAG], revalidate: 3600 },
)

const enqueue = createQueue()

export function saveSiteContent(input, username) {
  return enqueue(async () => {
    const content = cleanContent(input, DEFAULT_CONTENT)
    const doc = { version: 1, updatedAt: new Date().toISOString(), updatedBy: username, content }
    await writeJsonDocument(DOC_NAME, doc)
    revalidateTag(CONTENT_TAG, { expire: 0 })
    revalidatePath('/', 'layout')
    return doc
  })
}
