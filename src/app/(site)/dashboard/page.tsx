import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserDashboardClient from './UserDashboardClient'

export const metadata: Metadata = {
  title: 'Tableau de bord | HelvetiForma',
  description: 'Gérez vos achats et accédez à vos articles premium',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard')
  }

  return <UserDashboardClient />
}
