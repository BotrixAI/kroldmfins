import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { DB_FOLDER, getCloudinary, isCloudinaryConfigured } from './cloudinary'

// Reads and writes one JSON document, such as posts.json or site-content.json. In production
// it is a raw file in Cloudinary under <folder>/db, so the site needs no database; in local
// development without Cloudinary credentials it falls back to a gitignored file in .blog-data.
const LOCAL_DIR = path.join(process.cwd(), '.blog-data')
const canUseLocalFile = () => process.env.NODE_ENV !== 'production'

export async function readJsonDocument(name) {
  if (isCloudinaryConfigured()) {
    const cloudinary = getCloudinary()
    let resource
    try {
      resource = await cloudinary.api.resource(`${DB_FOLDER}/${name}`, { resource_type: 'raw' })
    } catch (err) {
      if (err?.error?.http_code === 404) return null
      throw new Error(`Could not read ${name} from Cloudinary: ${err?.error?.message || err?.message || err}`)
    }
    // The versioned URL is unique per save, so the CDN can never hand back an older copy.
    const res = await fetch(resource.secure_url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Could not download ${name} from Cloudinary (${res.status})`)
    return res.json()
  }

  if (!canUseLocalFile()) return null
  try {
    return JSON.parse(await fs.readFile(path.join(LOCAL_DIR, name), 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

export async function writeJsonDocument(name, doc) {
  const body = JSON.stringify(doc, null, 2)

  if (isCloudinaryConfigured()) {
    const cloudinary = getCloudinary()
    await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', public_id: `${DB_FOLDER}/${name}`, overwrite: true, invalidate: true },
        (err, result) => (err ? reject(new Error(err.message || 'Cloudinary upload failed')) : resolve(result)),
      )
      stream.end(Buffer.from(body, 'utf8'))
    })
    return
  }

  if (!canUseLocalFile()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
    )
  }
  await fs.mkdir(LOCAL_DIR, { recursive: true })
  await fs.writeFile(path.join(LOCAL_DIR, name), body, 'utf8')
}

// Writes from one server instance run one at a time, so two quick saves can't drop each other.
export function createQueue() {
  let queue = Promise.resolve()
  return (task) => {
    const run = queue.then(task)
    queue = run.catch(() => {})
    return run
  }
}
