'use client'

import { Fragment, createContext, useContext } from 'react'
import { DEFAULT_CONTENT } from '../lib/content/defaults'

// The figures from the Site data portal, loaded once in the root layout and read by any
// component with useSiteContent('nri'), etc.
const SiteContentContext = createContext(DEFAULT_CONTENT)

export function SiteContentProvider({ content, children }) {
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>
}

export function useSiteContent(page) {
  const content = useContext(SiteContentContext)
  return page ? content[page] : content
}

// Admin-written text: **double stars** make words bold. With `paragraphs`, each line becomes
// its own <p>, carrying `className`.
function Bold({ text, strongClass }) {
  return String(text)
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) =>
      i % 2 ? (
        <strong key={i} className={strongClass}>
          {part}
        </strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    )
}

export function RichText({ text, paragraphs = false, className, strongClass }) {
  if (!paragraphs) return <Bold text={text} strongClass={strongClass} />
  return String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => (
      <p key={i} className={className}>
        <Bold text={line} strongClass={strongClass} />
      </p>
    ))
}
