'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { getCountryOptions } from '../../lib/contactValidation'

// Flags are images because Windows doesn't draw flag emoji.
function Flag({ iso }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
      alt=""
      width={20}
      height={15}
      loading="lazy"
      onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
      className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
    />
  )
}

export default function CountryCodeSelect({ value, onChange }) {
  const countries = getCountryOptions()
  const selected = countries.find((c) => c.iso === value) ?? countries[0]
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)
  const searchRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '')
    if (!q) return countries
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dialCode.slice(1).startsWith(q) || c.iso.toLowerCase() === q,
    )
  }, [countries, query])

  useEffect(() => {
    if (!open) return
    const close = (e) => !rootRef.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', close)
    searchRef.current?.focus()
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const toggle = () => {
    setQuery('')
    setActive(Math.max(0, countries.indexOf(selected)))
    setOpen((o) => !o)
  }

  const choose = (c) => {
    onChange(c.iso)
    setOpen(false)
    rootRef.current?.querySelector('button')?.focus()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[active]) choose(filtered[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      rootRef.current?.querySelector('button')?.focus()
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country code: ${selected.name} ${selected.dialCode}`}
        className="flex h-full items-center gap-1.5 rounded-l-xl border-r border-primary-100 px-3 text-sm text-black outline-none transition-colors hover:bg-primary-50/60 focus-visible:bg-primary-50/60 dark:border-white/10 dark:text-white dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
      >
        <Flag iso={selected.iso} />
        <span className="tabular-nums">{selected.dialCode}</span>
        <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 text-black/40 transition-transform dark:text-white/40 ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl border border-primary-100 bg-white shadow-xl shadow-black/10 dark:border-white/10 dark:bg-neutral-900">
          <div className="border-b border-primary-100 p-2 dark:border-white/10">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={onKeyDown}
              placeholder="Search country or code"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].iso}` : undefined}
              className="w-full rounded-lg bg-primary-50/60 px-3 py-2 text-sm text-black outline-none placeholder:text-black/40 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-black/50 dark:text-white/50">No matches</li>}
            {filtered.map((c, i) => (
              <li
                key={c.iso}
                id={`${listId}-${c.iso}`}
                role="option"
                aria-selected={c.iso === selected.iso}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(c)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm ${
                  i === active ? 'bg-primary-50 dark:bg-white/10' : ''
                } ${c.iso === selected.iso ? 'font-semibold text-primary-600 dark:text-primary-400' : 'text-black dark:text-white'}`}
              >
                <Flag iso={c.iso} />
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <span className="tabular-nums text-black/50 dark:text-white/50">{c.dialCode}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
