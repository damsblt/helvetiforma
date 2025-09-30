import type { Metadata } from 'next'
import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap'
import './globals.css'

type Args = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Helvetiforma CMS',
  description: 'Content Management System for Helvetiforma',
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap}>
    {children}
  </RootLayout>
)

export default Layout
