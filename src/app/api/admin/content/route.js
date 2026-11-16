import { loadSiteContent, saveSiteContent } from '../../../../lib/content/store'
import { ContentError } from '../../../../lib/content/schema'
import { handleError, jsonError, readJson, requireAdmin } from '../../../../lib/blog/api'

// GET /api/admin/content  — the site's editable figures, as saved (or the built-in ones)
// PUT /api/admin/content  — replace them; { content } is checked field by field
export async function GET(request) {
  const { error } = await requireAdmin(request)
  if (error) return error
  try {
    return Response.json(await loadSiteContent())
  } catch (err) {
    return handleError(err)
  }
}

export async function PUT(request) {
  const { error, session } = await requireAdmin(request)
  if (error) return error
  const body = await readJson(request)
  if (!body?.content) return jsonError('Invalid request body.')
  try {
    const doc = await saveSiteContent(body.content, session.username)
    return Response.json(doc)
  } catch (err) {
    if (err instanceof ContentError) return jsonError(err.message, 422)
    return handleError(err)
  }
}
