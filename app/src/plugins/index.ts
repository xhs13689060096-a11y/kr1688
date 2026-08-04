import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { Plugin } from 'payload'

export const plugins: Plugin[] = [
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
]
