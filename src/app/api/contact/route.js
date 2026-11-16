// The site's contact form posts here; the enquiry is passed on to the Google Apps Script in
// google-apps-script/contact-form.gs, which adds it to the sheet and emails the owner.
const jsonError = (message, status = 400) => Response.json({ error: message }, { status })

const LIMITS = { name: 100, email: 200, phone: 30, city: 100, subject: 200, message: 3000 }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Submissions per client, kept in memory: enough to stop one visitor flooding the sheet.
const recent = new Map()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

function clientKey(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'local'
}

export async function POST(request) {
  const { CONTACT_SCRIPT_URL, CONTACT_SCRIPT_SECRET, CONTACT_NOTIFY_TO } = process.env
  if (!CONTACT_SCRIPT_URL || !CONTACT_SCRIPT_SECRET) {
    console.error('[contact] CONTACT_SCRIPT_URL and CONTACT_SCRIPT_SECRET must be set.')
    return jsonError('The contact form is not available right now. Please call or email us instead.', 503)
  }

  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return jsonError('Cross-site request blocked.', 403)

  let body
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid request.')
  }

  // A hidden field people never see; bots that fill every input get a quiet "success".
  if (body?.website) return Response.json({ ok: true })

  const fields = {}
  for (const [key, max] of Object.entries(LIMITS)) {
    const value = String(body?.[key] ?? '').trim()
    if (!value) return jsonError('Please fill in every field.', 422)
    if (value.length > max) return jsonError(`Please keep the ${key} under ${max} characters.`, 422)
    fields[key] = value
  }
  if (!EMAIL.test(fields.email)) return jsonError('Please enter a valid email address.', 422)

  const key = clientKey(request)
  const now = Date.now()
  const times = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (times.length >= MAX_PER_WINDOW) return jsonError('Too many messages. Please try again in a few minutes.', 429)

  try {
    // Apps Script answers a POST with a redirect to the result, which fetch follows.
    const res = await fetch(CONTACT_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...fields, secret: CONTACT_SCRIPT_SECRET, notifyTo: CONTACT_NOTIFY_TO ?? '' }),
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    })
    const result = await res.json().catch(() => null)
    if (!result?.ok) throw new Error(result?.error || `Apps Script responded ${res.status}`)
    if (result.emailError) console.error('[contact] Saved to the sheet, but the email failed:', result.emailError)
  } catch (err) {
    console.error('[contact]', err)
    return jsonError('We couldn’t send your message. Please try again, or call or email us instead.', 502)
  }

  recent.set(key, [...times, now])
  return Response.json({ ok: true })
}
