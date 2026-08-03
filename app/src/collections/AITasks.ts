import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const AITasks: CollectionConfig = {
  slug: 'ai-tasks',
  labels: {
    singular: 'AI Task',
    plural: 'AI Tasks',
  },
  admin: {
    description:
      'INTERNAL ONLY. AI 输出仅为草稿（isDraftOutput 默认为 true），不能自动发布内容。不连接外部 API。',
    useAsTitle: (doc: any) => {
      if (!doc) return ''
      const type = doc.taskType || 'unknown'
      const target =
        doc.target
          ? typeof doc.target === 'object'
            ? doc.target.titleAr || doc.target.title || doc.target.id || ''
            : doc.target
          : ''
      const parts = [type]
      if (target) parts.push(String(target))
      return parts.join(' — ')
    },
    defaultColumns: ['taskType', 'status', 'target', 'model', 'cost', 'updatedAt'],
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'taskType',
      type: 'select',
      required: true,
      options: [
        { label: 'Translation Assist', value: 'translation_assist' },
        { label: 'Metadata Generation', value: 'metadata_generation' },
        { label: 'Comment Moderation', value: 'comment_moderation' },
        { label: 'SEO Copy Draft', value: 'seo_copy_draft' },
        { label: 'Performance Insight', value: 'performance_insight' },
      ],
      label: 'Task Type',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'queued',
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Processing', value: 'processing' },
        { label: 'Draft Complete', value: 'draft_complete' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Failed', value: 'failed' },
      ],
      label: 'Status',
    },
    {
      name: 'target',
      type: 'relationship',
      relationTo: ['stories', 'chapters'],
      hasMany: false,
      label: 'Target',
      admin: {
        description: 'The story or chapter this AI task is targeting.',
      },
    },
    {
      name: 'input',
      type: 'json',
      label: 'Input',
      admin: {
        description: 'Input parameters for the AI task.',
      },
    },
    {
      name: 'output',
      type: 'json',
      label: 'Output',
      admin: {
        description: 'AI output — DRAFT ONLY, cannot be used to publish content.',
      },
    },
    {
      name: 'model',
      type: 'text',
      label: 'Model',
      admin: {
        description: 'Name of the AI model used.',
      },
    },
    {
      name: 'promptVersion',
      type: 'text',
      label: 'Prompt Version',
      admin: {
        description: 'Version identifier for the prompt used.',
      },
    },
    {
      name: 'cost',
      type: 'number',
      label: 'Cost (virtual)',
      admin: {
        description: 'Virtual / estimated cost — no real billing.',
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      label: 'Approved By',
      admin: {
        description: 'Admin who approved the AI output.',
      },
    },
    {
      name: 'error',
      type: 'textarea',
      label: 'Error',
      admin: {
        description: 'Error message if the task failed.',
      },
    },
    {
      name: 'isDraftOutput',
      type: 'checkbox',
      defaultValue: true,
      label: 'Is Draft Output',
      admin: {
        description:
          'AI output is draft only and cannot be used to auto-publish content.',
      },
    },
  ],
  timestamps: true,
}
