import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Site en Construction - HelvetiForma',
  description: 'Site en construction - Accès développeur uniquement',
}

export default function ConstructionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
