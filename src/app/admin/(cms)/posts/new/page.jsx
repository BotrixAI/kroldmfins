import PostEditor from '../../../../../components/admin/PostEditor'
import { listCategories } from '../../../../../lib/blog/store'
import { isCloudinaryConfigured } from '../../../../../lib/blog/cloudinary'
import { requireAdminPage } from '../../../../../lib/blog/session'

export default async function Page() {
  await requireAdminPage()
  return <PostEditor initialPost={null} categories={await listCategories()} cloudinary={isCloudinaryConfigured()} />
}
