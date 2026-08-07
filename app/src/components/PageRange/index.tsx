import React from 'react'

const defaultLabels = {
  plural: 'Docs',
  singular: 'Doc',
}

export const PageRange: React.FC<{
  className?: string
  collectionLabels?: {
    plural?: string
    singular?: string
  }
  currentPage?: number
  limit?: number
  totalDocs?: number
}> = (props) => {
  const {
    className,
    collectionLabels: collectionLabelsFromProps,
    currentPage,
    limit,
    totalDocs,
  } = props

  let indexStart = (currentPage ? currentPage - 1 : 1) * (limit || 1) + 1
  if (totalDocs && indexStart > totalDocs) indexStart = 0

  let indexEnd = (currentPage || 1) * (limit || 1)
  if (totalDocs && indexEnd > totalDocs) indexEnd = totalDocs

  const { plural, singular } =
    collectionLabelsFromProps || defaultLabels || {}

  return (
    <div className={[className, 'font-semibold'].filter(Boolean).join(' ')}>
      {(typeof totalDocs === 'undefined' || totalDocs === 0) && 'لا توجد نتائج'}
      {typeof totalDocs !== 'undefined' &&
        totalDocs > 0 &&
        `عرض ${indexStart}${indexStart > 0 ? ` - ${indexEnd}` : ''} من ${totalDocs} ${
          totalDocs > 1 ? plural : singular
        }`}
    </div>
  )
}
