'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LuCircleCheck, LuExternalLink, LuInfo, LuMapPin, LuRotateCcw, LuTriangleAlert } from 'react-icons/lu'
import { CONTENT_PAGES } from '../../../lib/content/schema'
import { DEFAULT_CONTENT } from '../../../lib/content/defaults'
import { Button, ConfirmDialog, Toast } from '../ui'
import { PANEL, api, useToast } from '../client'
import { FieldGrid } from './Fields'

// The Site data portal: every figure on the site that the admin can change, grouped by the
// page and section it appears in (see lib/content/schema.js).

const sectionValues = (content, pageId, section) =>
  JSON.stringify(section.fields.map((f) => content?.[pageId]?.[f.key]))

function formatSaved(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function ContentEditor({ initial, loadError, cloudinary }) {
  const router = useRouter()
  const [saved, setSaved] = useState(initial?.content ?? DEFAULT_CONTENT)
  const [draft, setDraft] = useState(initial?.content ?? DEFAULT_CONTENT)
  const [meta, setMeta] = useState({ updatedAt: initial?.updatedAt, updatedBy: initial?.updatedBy })
  const [pageId, setPageId] = useState(CONTENT_PAGES[0].id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [restoring, setRestoring] = useState(null)
  const [discarding, setDiscarding] = useState(false)
  const [toast, showToast] = useToast()

  // Which sections have unsaved edits, as "pageId/sectionId".
  const dirty = useMemo(() => {
    const out = new Set()
    for (const page of CONTENT_PAGES) {
      for (const section of page.sections) {
        if (sectionValues(draft, page.id, section) !== sectionValues(saved, page.id, section)) out.add(`${page.id}/${section.id}`)
      }
    }
    return out
  }, [draft, saved])

  useEffect(() => {
    if (!dirty.size) return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty.size])

  const page = CONTENT_PAGES.find((p) => p.id === pageId)

  const choosePage = (id) => {
    setPageId(id)
    window.scrollTo({ top: 0 })
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const doc = await api('/api/admin/content', { method: 'PUT', body: { content: draft } })
      setSaved(doc.content)
      setDraft(doc.content)
      setMeta({ updatedAt: doc.updatedAt, updatedBy: doc.updatedBy })
      showToast('Saved. The website now shows the new figures.')
      router.refresh()
    } catch (err) {
      setError(err.message)
      showToast('Not saved: please check the message at the bottom of the screen.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const restoreSection = () => {
    const { pageId: pid, section } = restoring
    setDraft((d) => ({
      ...d,
      [pid]: { ...d[pid], ...Object.fromEntries(section.fields.map((f) => [f.key, structuredClone(DEFAULT_CONTENT[pid][f.key])])) },
    }))
    setRestoring(null)
    showToast('Original figures put back. Press “Save changes” to publish them.')
  }

  const pageDirtyCount = (id) => [...dirty].filter((k) => k.startsWith(`${id}/`)).length

  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-32 pt-8 lg:px-6 lg:pt-10">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-black dark:text-white">Site data</h1>
        <p className="mt-1 text-sm leading-relaxed text-black/55 dark:text-white/55">
          Update the numbers, rates and sources shown on the website. Choose a page on the left, change what you need, then
          press <strong className="font-semibold text-black/75 dark:text-white/80">Save changes</strong>. The website updates
          straight away.
        </p>
        {meta.updatedAt ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-black/45 dark:text-white/45">
            <LuCircleCheck className="h-3.5 w-3.5 text-secondary-600" />
            Last saved {formatSaved(meta.updatedAt)}
            {meta.updatedBy ? ` by ${meta.updatedBy}` : ''}
          </p>
        ) : (
          <p className="mt-2 text-xs text-black/45 dark:text-white/45">Nothing changed yet: the site is showing its original figures.</p>
        )}
      </div>

      {!cloudinary ? (
        <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <LuTriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>Cloudinary isn&apos;t connected.</strong> Changes are saved to a local file for development only. Add the
            Cloudinary credentials to the environment before going live.
          </p>
        </div>
      ) : null}
      {loadError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          Couldn&apos;t load the saved figures, so the original ones are shown. Saving now would replace whatever is stored.
          <span className="mt-1 block text-xs opacity-80">{loadError}</span>
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* ─── Side panel: pages and their sections ───────────── */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav aria-label="Pages" className={`${PANEL} p-2`}>
            <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/45 dark:text-white/45">Pages</p>
            <ul className="space-y-0.5">
              {CONTENT_PAGES.map((p) => {
                const active = p.id === pageId
                const count = pageDirtyCount(p.id)
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => choosePage(p.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
                          : 'text-black/70 hover:bg-black/[0.04] dark:text-white/70 dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      {p.title}
                      {count ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                          {count} unsaved
                        </span>
                      ) : null}
                    </button>
                    {active ? (
                      <ul className="mb-2 ml-3 mt-1 space-y-0.5 border-l border-black/10 pl-2 dark:border-white/10">
                        {p.sections.map((s) => (
                          <li key={s.id}>
                            <a
                              href={`#section-${s.id}`}
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] leading-snug text-black/60 hover:bg-black/[0.04] hover:text-black dark:text-white/60 dark:hover:bg-white/[0.06] dark:hover:text-white"
                            >
                              <span className="min-w-0 flex-1">{s.title}</span>
                              {dirty.has(`${p.id}/${s.id}`) ? <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" title="Unsaved changes" /> : null}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="mt-4 hidden rounded-2xl border border-primary-100 bg-primary-50/60 p-4 text-[13px] leading-relaxed text-black/65 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/65 lg:block">
            <p className="flex items-center gap-1.5 font-semibold text-black/80 dark:text-white/85">
              <LuInfo className="h-4 w-4 text-primary-600 dark:text-primary-400" /> Tips
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4">
              <li>Each box says where on the site it appears. Use “View on site” to check.</li>
              <li>When you change a figure, update its source and the “checked” date too.</li>
              <li>“Restore original” puts back the figures the site was built with.</li>
            </ul>
          </div>
        </aside>

        {/* ─── The chosen page's sections ─────────────────────── */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-black dark:text-white">{page.title}</h2>
            <a
              href={page.path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-600 dark:text-primary-300"
            >
              Open this page <LuExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-4 space-y-5">
            {page.sections.map((section) => {
              const isDirty = dirty.has(`${page.id}/${section.id}`)
              const isOriginal = sectionValues(draft, page.id, section) === sectionValues(DEFAULT_CONTENT, page.id, section)
              return (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className={`${PANEL} scroll-mt-20 overflow-hidden ${isDirty ? 'ring-2 ring-amber-300 dark:ring-amber-500/40' : ''}`}
                >
                  <header className="border-b border-black/[0.06] bg-black/[0.015] px-5 py-4 dark:border-white/10 dark:bg-white/[0.02] sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-black dark:text-white">
                          {section.title}
                          {isDirty ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                              Unsaved
                            </span>
                          ) : null}
                        </h3>
                        <p className="mt-1 flex items-start gap-1.5 text-sm leading-relaxed text-black/55 dark:text-white/55">
                          <LuMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                          <span>
                            <span className="font-medium text-black/70 dark:text-white/70">Where: </span>
                            {section.where}
                          </span>
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <a
                          href={section.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-black/65 hover:bg-black/[0.05] dark:text-white/65 dark:hover:bg-white/[0.07]"
                        >
                          View on site <LuExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={LuRotateCcw}
                          disabled={isOriginal}
                          onClick={() => setRestoring({ pageId: page.id, section })}
                          title={isOriginal ? 'Already showing the original figures' : undefined}
                        >
                          Restore original
                        </Button>
                      </div>
                    </div>
                  </header>
                  <div className="space-y-5 p-5 sm:p-6">
                    <FieldGrid
                      fields={section.fields}
                      value={draft[page.id]}
                      onChange={(next) => setDraft((d) => ({ ...d, [page.id]: next }))}
                      id={`${page.id}-${section.id}`}
                    />
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── Save bar ───────────────────────────────────────── */}
      {dirty.size || error ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/95">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
            <div className="min-w-0 flex-1 text-sm">
              {error ? (
                <p className="flex items-start gap-2 font-medium text-red-700 dark:text-red-300">
                  <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              ) : (
                <p className="text-black/70 dark:text-white/70">
                  <strong className="font-semibold text-black dark:text-white">
                    {dirty.size} section{dirty.size === 1 ? '' : 's'}
                  </strong>{' '}
                  changed. Nothing is on the website until you save.
                </p>
              )}
            </div>
            {dirty.size ? (
              <>
                <Button variant="ghost" onClick={() => setDiscarding(true)} disabled={saving}>
                  Discard changes
                </Button>
                <Button variant="primary" onClick={save} loading={saving}>
                  Save changes
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setError(null)}>
                Dismiss
              </Button>
            )}
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(restoring)}
        title="Restore the original figures?"
        message={
          restoring ? (
            <>
              “{restoring.section.title}” will go back to the figures the website was built with. Nothing changes on the
              site until you press Save changes.
            </>
          ) : null
        }
        confirmLabel="Restore original"
        onConfirm={restoreSection}
        onClose={() => setRestoring(null)}
      />
      <ConfirmDialog
        open={discarding}
        title="Discard your changes?"
        message="Every unsaved change on every page will be undone, back to what the website shows now."
        confirmLabel="Discard changes"
        danger
        onConfirm={() => {
          setDraft(saved)
          setError(null)
          setDiscarding(false)
        }}
        onClose={() => setDiscarding(false)}
      />
      <Toast toast={toast} />
    </main>
  )
}
