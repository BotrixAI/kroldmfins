'use client'

import { LuArrowDown, LuArrowUp, LuChevronDown, LuPlus, LuTrash2 } from 'react-icons/lu'
import { INPUT } from '../client'

// Inputs for the Site data portal, drawn from the field descriptions in lib/content/schema.js.

const FIELD_LABEL = 'mb-1 block text-sm font-semibold text-black/80 dark:text-white/85'
const HELP = 'mt-1 text-xs leading-relaxed text-black/50 dark:text-white/50'
const ICON_BUTTON =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg text-black/50 transition-colors hover:bg-black/5 hover:text-black disabled:pointer-events-none disabled:opacity-30 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white'

const isWide = (field) => field.type === 'textarea' || field.type === 'list'

// Numbers are kept as typed until they read as a number, so "7." or "1,000" can be typed freely;
// the server turns whatever is left into a number when saving.
function toNumberish(raw) {
  const n = Number(raw)
  return raw.trim() !== '' && String(n) === raw.trim() ? n : raw
}
export const isBadNumber = (value) => value === '' || value == null || !Number.isFinite(Number(String(value).replace(/,/g, '')))

function emptyItem(fields) {
  return Object.fromEntries(fields.map((f) => [f.key, f.type === 'toggle' ? false : f.type === 'list' ? [] : '']))
}

export function Field({ field, value, onChange, id }) {
  const inputId = `f-${id}`

  if (field.type === 'list') return <ListField field={field} value={value} onChange={onChange} id={id} />

  if (field.type === 'toggle') {
    return (
      <label htmlFor={inputId} className="flex h-full cursor-pointer items-center gap-2.5 pt-6 text-sm font-medium text-black/75 dark:text-white/80">
        <input
          id={inputId}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded accent-primary-600"
        />
        {field.label}
      </label>
    )
  }

  const bad = field.type === 'number' && isBadNumber(value)
  const common = {
    id: inputId,
    className: `${INPUT} ${bad ? 'border-red-400 focus:border-red-400 focus:ring-red-100 dark:border-red-500/60' : ''}`,
    placeholder: field.placeholder,
  }

  let input
  if (field.type === 'textarea') {
    const rows = field.rows ?? Math.min(8, Math.max(2, Math.ceil(String(value ?? '').length / 90)))
    input = <textarea {...common} rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={`${common.className} resize-y leading-relaxed`} />
  } else if (field.type === 'number') {
    input = <input {...common} type="text" inputMode="decimal" value={value ?? ''} onChange={(e) => onChange(toNumberish(e.target.value))} />
  } else if (field.type === 'date') {
    input = <input {...common} type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  } else if (field.type === 'url') {
    const link = /^https?:\/\//i.test(String(value ?? '').trim()) ? String(value).trim() : null
    input = (
      <div className="flex items-center gap-2">
        <input {...common} type="url" inputMode="url" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-semibold text-primary-700 hover:underline dark:text-primary-300"
            title="Open this link in a new tab to check it"
          >
            Check
          </a>
        ) : null}
      </div>
    )
  } else {
    input = <input {...common} type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
  }

  return (
    <div className="min-w-0">
      {field.label ? (
        <label htmlFor={inputId} className={FIELD_LABEL}>
          {field.label}
        </label>
      ) : null}
      {input}
      {bad ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">Please enter a number.</p> : null}
      {field.help ? <p className={HELP}>{field.help}</p> : null}
    </div>
  )
}

const GRID = {
  1: 'grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

// Lays out an item's fields: short ones side by side, text boxes and lists full width.
export function FieldGrid({ fields, value, onChange, id }) {
  const short = fields.filter((f) => !isWide(f)).length
  const cols = GRID[Math.min(4, Math.max(1, short))]
  return (
    <div className={`grid gap-4 ${cols}`}>
      {fields.map((f) => (
        <div key={f.key} className={isWide(f) ? 'col-span-full' : ''}>
          <Field field={f} value={value?.[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} id={`${id}-${f.key}`} />
        </div>
      ))}
    </div>
  )
}

function ListField({ field, value = [], onChange, id }) {
  const items = Array.isArray(value) ? value : []
  const canEdit = !field.fixed
  const max = field.max ?? 100
  const min = field.min ?? 0
  const noun = field.itemLabel.toLowerCase()

  const set = (i, item) => onChange(items.map((it, j) => (j === i ? item : it)))
  const remove = (i) => onChange(items.filter((_, j) => j !== i))
  const move = (i, by) => {
    const next = [...items]
    ;[next[i], next[i + by]] = [next[i + by], next[i]]
    onChange(next)
  }
  const add = () => onChange([...items, emptyItem(field.fields)])

  const controls = (i) =>
    canEdit ? (
      <div className="flex shrink-0 items-center">
        <button type="button" className={ICON_BUTTON} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${noun} ${i + 1} up`} title="Move up">
          <LuArrowUp className="h-4 w-4" />
        </button>
        <button type="button" className={ICON_BUTTON} onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${noun} ${i + 1} down`} title="Move down">
          <LuArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${ICON_BUTTON} hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-500/10 dark:hover:!text-red-400`}
          onClick={() => remove(i)}
          disabled={items.length <= min}
          aria-label={`Remove ${noun} ${i + 1}`}
          title="Remove"
        >
          <LuTrash2 className="h-4 w-4" />
        </button>
      </div>
    ) : null

  const addButton =
    canEdit && items.length < max ? (
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-primary-300 px-3.5 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 dark:border-primary-400/40 dark:text-primary-300 dark:hover:bg-primary-500/10"
      >
        <LuPlus className="h-4 w-4" /> Add {noun}
      </button>
    ) : null

  // Short rows of numbers (the Sensex years): a compact table rather than a card per row.
  if (field.compact) {
    const columns = { gridTemplateColumns: `repeat(${field.fields.length}, minmax(0, 1fr)) 6rem` }
    return (
      <div>
        {field.label ? <p className={FIELD_LABEL}>{field.label}</p> : null}
        <div className="overflow-hidden rounded-xl border border-black/[0.08] dark:border-white/10">
          <div style={columns} className="grid gap-3 border-b border-black/[0.08] bg-black/[0.02] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-black/50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/50">
            {field.fields.map((f) => (
              <span key={f.key}>{f.label}</span>
            ))}
            <span />
          </div>
          <ul className="max-h-[420px] divide-y divide-black/[0.06] overflow-y-auto dark:divide-white/10">
            {items.map((item, i) => (
              <li key={i} style={columns} className="grid items-center gap-3 px-3 py-1.5">
                {field.fields.map((f) => {
                  const bad = f.type === 'number' && isBadNumber(item?.[f.key])
                  return (
                    <input
                      key={f.key}
                      aria-label={`${f.label}, ${noun} ${i + 1}`}
                      inputMode="decimal"
                      value={item?.[f.key] ?? ''}
                      onChange={(e) => set(i, { ...item, [f.key]: toNumberish(e.target.value) })}
                      className={`${INPUT} h-9 py-1.5 tabular-nums ${bad ? 'border-red-400' : ''}`}
                    />
                  )
                })}
                {controls(i)}
              </li>
            ))}
          </ul>
        </div>
        {field.help ? <p className={HELP}>{field.help}</p> : null}
        <div className="mt-3">{addButton}</div>
      </div>
    )
  }

  return (
    <div>
      {field.label ? <p className={FIELD_LABEL}>{field.label}</p> : null}
      <ol className="space-y-3">
        {items.map((item, i) => {
          const title = field.titleKey && item?.[field.titleKey] !== '' ? String(item?.[field.titleKey] ?? '') : ''
          const heading = (
            <span className="min-w-0 truncate text-sm font-semibold text-black/75 dark:text-white/80">
              <span className="text-black/40 dark:text-white/40">
                {field.itemLabel} {i + 1}
                {title ? ' · ' : ''}
              </span>
              {title}
            </span>
          )
          const body = <FieldGrid fields={field.fields} value={item} onChange={(v) => set(i, v)} id={`${id}-${i}`} />

          if (field.collapsed) {
            return (
              <li key={i}>
                <details className="group rounded-xl border border-black/[0.08] bg-black/[0.015] dark:border-white/10 dark:bg-white/[0.02]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    {heading}
                    <span className="flex items-center gap-2 text-xs font-medium text-black/45 dark:text-white/45">
                      <span className="hidden sm:inline">{Array.isArray(item?.items) ? `${item.items.length} questions` : ''}</span>
                      <LuChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>
                  <div className="border-t border-black/[0.06] p-4 dark:border-white/10">{body}</div>
                </details>
              </li>
            )
          }

          return (
            <li key={i} className="rounded-xl border border-black/[0.08] bg-black/[0.015] p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="mb-3 flex items-center justify-between gap-3">
                {heading}
                {controls(i)}
              </div>
              {body}
            </li>
          )
        })}
      </ol>
      {addButton ? <div className="mt-3">{addButton}</div> : null}
    </div>
  )
}
