import path from 'path'
import { buildConfig } from 'payload/config'
import Pages from './src/collections/Pages'
import Media from './src/collections/Media'
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_URL || '',
  admin: {
    user: null,
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL as string,
      ssl: true,
    },
  }),
  collections: [Pages, Media],
  typescript: {
    outputFile: path.resolve(__dirname, './payload-types.ts'),
  },
})


