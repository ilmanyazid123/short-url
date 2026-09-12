import { redirect } from 'next/navigation'
import { getAuthRole } from '@/lib/auth'
import { RootDashboard } from '@/components/root-dashboard'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const role = await getAuthRole()
  if (role !== 'root') {
    redirect('/login-root?from=/root')
  }
  return <RootDashboard username={role === 'root' ? 'root' : ''} />
}
