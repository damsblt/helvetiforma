import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import UserDashboardClient from './UserDashboardClient'

export const metadata: Metadata = {
  title: 'Tableau de bord | HelvetiForma',
  description: 'Gérez vos achats et accédez à vos articles premium',
}

export default function DashboardPage() {
  // Since we're using client-side authentication with AuthContext,
  // we'll let the client component handle the authentication check
  return <UserDashboardClient />
}
