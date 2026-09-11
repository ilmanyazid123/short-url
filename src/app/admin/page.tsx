import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { AdminDashboard } from '@/components/admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const authed = await isAuthenticated()
  if (!authed) {
    redirect('/login?from=/admin')
  }
  return <AdminDashboard username="admin" />
}
