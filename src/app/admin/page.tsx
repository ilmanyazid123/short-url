import { redirect } from 'next/navigation'
import { getAuthRole } from '@/lib/auth'
import { AdminDashboard } from '@/components/admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const role = await getAuthRole()
  if (!role) {
    redirect('/login?from=/admin')
  }
  // Both 'admin' and 'root' can view the admin dashboard.
  // Root users get a hint banner suggesting they use the root panel.
  return <AdminDashboard username={role} />
}
