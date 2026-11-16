/**
 * Contact form → Google Sheet + owner email.
 *
 * The website's /api/contact route POSTs each enquiry here. This script appends it as a row
 * to the "Enquiries" tab (created on first use) and emails the address the website sends in
 * `notifyTo`, from the Gmail account that owns this sheet.
 *
 * Setup (once per sheet — repeat in the client's own sheet at handover):
 *   1. Open the Google Sheet → Extensions → Apps Script. Replace the editor's contents with this file.
 *   2. Project Settings (gear icon) → Script Properties → Add property:
 *        CONTACT_SECRET = the same long random string as CONTACT_SCRIPT_SECRET in the website's .env
 *   3. Deploy → New deployment → type "Web app":
 *        Execute as: Me        Who has access: Anyone
 *      Authorise when asked (Google warns the app is unverified: Advanced → Go to … (unsafe)).
 *   4. Copy the Web app URL (ends in /exec) into CONTACT_SCRIPT_URL in the website's .env.
 *
 * After editing this script, publish the change with Deploy → Manage deployments → Edit (pencil)
 * → Version: New version. That keeps the same URL; a "New deployment" would create a new one.
 */

const TAB_NAME = 'Enquiries'
const HEADERS = ['Submitted at', 'Name', 'Email', 'Phone', 'City', 'Subject', 'Message']

function doPost(e) {
  let data
  try {
    data = JSON.parse(e.postData.contents)
  } catch (err) {
    return reply({ ok: false, error: 'Invalid request body.' })
  }

  const secret = PropertiesService.getScriptProperties().getProperty('CONTACT_SECRET')
  if (!secret || data.secret !== secret) return reply({ ok: false, error: 'Unauthorised.' })

  const fields = {
    name: clean(data.name),
    email: clean(data.email),
    phone: clean(data.phone),
    city: clean(data.city),
    subject: clean(data.subject),
    message: clean(data.message),
  }

  // Two enquiries arriving together must not write over each other's row.
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    const sheet = getSheet()
    sheet.appendRow([new Date(), fields.name, fields.email, fields.phone, fields.city, fields.subject, fields.message].map(safeCell))
  } finally {
    lock.releaseLock()
  }

  // The row is what matters; a failed email is reported back but doesn't fail the enquiry.
  let emailError = null
  if (data.notifyTo) {
    try {
      sendNotification(String(data.notifyTo), fields)
    } catch (err) {
      emailError = String(err)
    }
  }

  return reply({ ok: true, emailError })
}

function getSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = book.getSheetByName(TAB_NAME)
  if (!sheet) sheet = book.insertSheet(TAB_NAME)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

function sendNotification(to, f) {
  const rows = [
    ['Name', f.name],
    ['Email', f.email],
    ['Phone', f.phone],
    ['City', f.city],
    ['Subject', f.subject],
  ]
    .map(([label, value]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${label}</td><td style="padding:4px 0"><b>${escapeHtml(value)}</b></td></tr>`)
    .join('')

  MailApp.sendEmail({
    to: to,
    replyTo: f.email,
    name: 'Krold Mfins Website',
    subject: `New enquiry: ${f.subject || 'Website contact form'} — ${f.name}`,
    body: `New enquiry from the website.\n\nName: ${f.name}\nEmail: ${f.email}\nPhone: ${f.phone}\nCity: ${f.city}\nSubject: ${f.subject}\n\n${f.message}\n\nReply to this email to answer ${f.name} directly.`,
    htmlBody:
      `<p>New enquiry from the website.</p><table style="border-collapse:collapse">${rows}</table>` +
      `<p style="margin-top:16px;white-space:pre-wrap">${escapeHtml(f.message)}</p>` +
      `<p style="color:#888;font-size:12px">Reply to this email to answer ${escapeHtml(f.name)} directly. All enquiries: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}</p>`,
  })
}

function clean(value) {
  return String(value == null ? '' : value).trim().slice(0, 5000)
}

// A value starting with = + - @ would run as a formula in the sheet; a leading ' keeps it text.
function safeCell(value) {
  return typeof value === 'string' && /^[=+\-@]/.test(value) ? `'${value}` : value
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON)
}
