import ContentEditor from '../../../../components/admin/content/ContentEditor'
import { loadSiteContent } from '../../../../lib/content/store'
import { isCloudinaryConfigured } from '../../../../lib/blog/cloudinary'
import { requireAdminPage } from '../../../../lib/blog/session'

export const metadata = { title: 'Site data | Krold Mfins' }

export default async function Page() {
  await requireAdminPage()
  let data = null
  let loadError = null
  try {
    data = await loadSiteContent()
  } catch (err) {
    loadError = err.message
  }
  return <ContentEditor initial={data} loadError={loadError} cloudinary={isCloudinaryConfigured()} />
}
