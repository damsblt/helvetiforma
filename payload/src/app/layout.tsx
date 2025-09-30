/* THIS IMPORT IS NECESSARY FOR TYPESCRIPT */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from 'react'
import type { ServerFunctionClient } from 'payload'

import type { Metadata } from 'next'
import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap'
import './globals.css'

export const metadata: Metadata = {
  title: 'Helvetiforma CMS',
  description: 'Content Management System for Helvetiforma',
}

// Server function client stub - required by Payload v3.58
const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  // This is a placeholder - server functions would be implemented here if needed
  return null
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RootLayout 
      config={config} 
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  )
}

export default Layout
