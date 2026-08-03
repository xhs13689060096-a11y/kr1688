/**
 * KR1688 fallback Payload config direction.
 * This file exists to make the future collection boundaries explicit for AI and human executors.
 */

export const payloadConfigDirection = {
  collections: [
    'stories',
    'chapters',
    'media',
    'users',
    'comments',
    'favorites',
    'readingProgress',
    'aiTasks',
  ],
  globals: ['siteSettings'],
}
