/* THIS IMPORT IS NECESSARY FOR TYPESCRIPT */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from 'react'

import type { Metadata } from 'next'
import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap'
import './globals.css'

export const metadata: Metadata = {
  title: 'Helvetiforma CMS',
  description: 'Content Management System for Helvetiforma',
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <RootLayout config={config} importMap={importMap}>{children}</RootLayout>
}

export default Layout
