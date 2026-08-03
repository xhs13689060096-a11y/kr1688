import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'KR1688',
      label: 'Site Name',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      required: true,
      defaultValue: 'منصة القصص العربية — اقرأ واستمتع بأجمل القصص العربية',
      label: 'Site Description',
    },
    {
      name: 'defaultLocale',
      type: 'text',
      required: true,
      defaultValue: 'ar',
      label: 'Default Locale',
      admin: {
        description: 'ISO 639-1 language code',
      },
    },
    {
      name: 'defaultDirection',
      type: 'select',
      required: true,
      defaultValue: 'rtl',
      options: [
        { label: 'RTL (Right-to-Left)', value: 'rtl' },
        { label: 'LTR (Left-to-Right)', value: 'ltr' },
      ],
      label: 'Default Text Direction',
    },
  ],
}
