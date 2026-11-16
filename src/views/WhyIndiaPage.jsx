'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Link from '../components/Link'
import { CARD, Eyebrow } from '../components/nri/parts'
import { RingMark } from '../components/about/Rings'
import { ChangeBars, ChartCard, ColumnChart, SensexLine, StackedShare } from '../components/why-india/Charts'
import GetInTouch from '../components/GetInTouch'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import { DIVERSIFICATION, STABILITY } from '../data/whyIndia'
import { RichText, useSiteContent } from '../components/SiteContent'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const H2 = 'mt-3 text-3xl font-semibold leading-tight text-balance text-black dark:text-white sm:text-4xl'
const BODY = 'text-base leading-relaxed text-black/65 dark:text-white/65'
const STRONG = 'font-semibold text-black/85 dark:text-white/90'

const SECTIONS = [
  ['economy', 'Economy'],
  ['people', 'People'],
  ['digital', 'Digital'],
  ['make-in-india', 'Make in India'],
  ['institutions', 'Institutions'],
  ['markets', 'Markets'],
  ['global', 'Global view'],
  ['portfolio', 'Portfolio'],
]
const num = (id) => String(SECTIONS.findIndex(([key]) => key === id) + 1).padStart(2, '0')
const tag = (id) => `${num(id)} · ${SECTIONS.find(([key]) => key === id)[1]}`

function Arrow({ className = '', flip = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${className} ${flip ? 'rotate-180' : ''}`} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// `split` puts the text beside the heading on large screens, to save height.
function SectionHead({ id, title, children, light = false, split = false }) {
  const heading = (
    <>
      <Eyebrow className={light ? 'text-primary-300' : undefined}>{tag(id)}</Eyebrow>
      <h2 className={light ? 'mt-3 text-3xl font-semibold leading-tight text-balance sm:text-4xl' : H2}>{title}</h2>
    </>
  )
  if (split) {
    return (
      <div data-reveal className="lg:flex lg:items-end lg:justify-between lg:gap-12">
        <div className="max-w-xl shrink-0">{heading}</div>
        <div className="max-w-xl lg:[&>*:first-child]:mt-0">{children}</div>
      </div>
    )
  }
  return (
    <div data-reveal className="max-w-3xl">
      {heading}
      {children}
    </div>
  )
}

// The Sensex chart plots year-end closes at x = year, so a date in the following year sits
// between that year and the next: 13 Oct 2026 → about 2025.78.
function sensexChart(c) {
  const points = c.sensexPoints.map((p) => [p.year, p.close])
  const date = new Date(`${c.sensexLatestDate}T00:00:00Z`)
  const year = date.getUTCFullYear()
  const dayOfYear = (date - Date.UTC(year, 0, 1)) / 86400000
  const label = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  const latest = { x: year - 1 + dayOfYear / 365, value: c.sensexLatestValue, label }
  const first = points[0][0]
  const last = points[points.length - 1][0]
  return { points, latest, title: `BSE Sensex, year-end close (${first}–${last}) and ${label}` }
}

export default function WhyIndiaPage() {
  const c = useSiteContent('whyIndia')
  const sensex = sensexChart(c)
  const pageRef = useRef(null)
  const heroRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current.children, { opacity: 0, y: 26, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.1 })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  useRevealOnScroll(pageRef, (root) => root.querySelectorAll('[data-reveal]'), { y: 28, duration: 0.7, threshold: 0.08 })

  return (
    <main ref={pageRef} className="relative overflow-hidden">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative border-b border-black/5 dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--color-primary-50),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(54,161,218,0.08),transparent_55%)]" />
        <div
          className="pointer-events-none absolute inset-0 -z-10 text-black/[0.035] dark:text-white/[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        <div ref={heroRef} className="mx-auto max-w-6xl px-5 py-10 lg:px-10 lg:py-12">
          <Link
            href="/nri"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-black/60 transition-colors hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 dark:text-white/60 dark:hover:text-primary-400"
          >
            <Arrow flip className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to NRI services
          </Link>
          <Eyebrow className="mt-6 text-primary-600 dark:text-primary-400">Why India</Eyebrow>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.1] text-balance text-black dark:text-white sm:text-5xl lg:text-[3.5rem]">
            The case for investing{' '}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text pb-2 text-transparent">back home</span>
          </h1>
          <p className={`mt-4 max-w-3xl ${BODY}`}>{c.intro}</p>
          <nav aria-label="On this page" className="mt-7">
            <ul className="flex flex-wrap gap-2">
              {SECTIONS.map(([id, label], i) => (
                <li key={id}>
                  <Link
                    href={`/nri/why-invest-in-india#${id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/70 px-4 py-2 text-sm font-semibold text-black/65 transition-colors hover:border-primary-300 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-white/10 dark:bg-transparent dark:text-white/65 dark:hover:text-primary-400"
                  >
                    <span className="tabular-nums text-black/35 dark:text-white/35">{String(i + 1).padStart(2, '0')}</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* ─── 01 Economy ───────────────────────────────────────── */}
      <section id="economy" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 lg:grid-cols-[1fr_1fr] lg:gap-12 lg:px-10">
          <SectionHead id="economy" title="Robust Economic Growth">
            <div className={`mt-3 space-y-3 ${BODY}`}>
              <RichText text={c.economyText} paragraphs strongClass={STRONG} />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-black/45 dark:text-white/45">Sources: {c.economySources}</p>
          </SectionHead>
          <ChartCard title={c.gdpTitle} source={c.gdpSource}>
            <ColumnChart bars={c.gdpBars} />
          </ChartCard>
        </div>
      </section>

      {/* ─── 02 People ────────────────────────────────────────── */}
      <section id="people" className="scroll-mt-20 border-t border-black/5 bg-primary-50/40 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:px-10">
          <SectionHead id="people" title="Demographic Dividend" split>
            <RichText text={c.peopleText} paragraphs className={`mt-3 ${BODY}`} strongClass={STRONG} />
          </SectionHead>

          <dl className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.peopleStats.map((s, i) => (
              <div key={i} data-reveal className={`${CARD} bg-white p-5 dark:bg-white/[0.03]`}>
                <dd className="text-3xl font-semibold leading-none text-primary-600 dark:text-primary-400">{s.value}</dd>
                <dt className="mt-2 text-sm leading-relaxed text-black/65 dark:text-white/65">{s.label}</dt>
              </div>
            ))}
          </dl>

          <ChartCard title={c.ageTitle} source={c.ageSource} className="mt-4">
            <StackedShare groups={c.ageGroups} />
          </ChartCard>
        </div>
      </section>

      {/* ─── 03 Digital ───────────────────────────────────────── */}
      <section id="digital" className="scroll-mt-20 border-t border-black/5 dark:border-white/10">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 lg:grid-cols-[1fr_1fr] lg:gap-12 lg:px-10">
          <SectionHead id="digital" title="Digital Transformation: the UPI Revolution">
            <RichText text={c.digitalText} paragraphs className={`mt-3 ${BODY}`} strongClass={STRONG} />
          </SectionHead>
          <ChartCard title={c.upiTitle} source={c.upiSource}>
            <ColumnChart bars={c.upiBars} />
          </ChartCard>
        </div>
      </section>

      {/* ─── 04 Make in India ─────────────────────────────────── */}
      <section id="make-in-india" className="scroll-mt-20 px-3 pb-12 sm:px-5">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#0b1826] text-white ring-1 ring-white/5 lg:rounded-[2.5rem]">
          <RingMark
            count={4}
            from="var(--color-primary-500)"
            to="var(--color-secondary-500)"
            className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] opacity-[0.07]"
          />
          <div className="relative px-6 py-10 sm:px-10 lg:px-14">
            <SectionHead id="make-in-india" title="From importer to manufacturing hub" light split>
              <RichText
                text={c.makeText}
                paragraphs
                className="mt-3 text-[15px] leading-relaxed text-white/65"
                strongClass="font-semibold text-white/90"
              />
            </SectionHead>

            {/* Phones: one row per sector */}
            <ul data-reveal className="mt-7 divide-y divide-white/10 border-y border-white/10 md:hidden">
              {c.makeRows.map((row, i) => (
                <li key={i} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-medium text-white/90">{row.sector}</p>
                    <p className="font-semibold tabular-nums text-secondary-400">{row.growth}</p>
                  </div>
                  <p className="mt-1 text-sm tabular-nums text-white/65">
                    {row.from} <span className="text-white/40">({c.makeFromYear})</span> → {row.to}{' '}
                    <span className="text-white/40">({c.makeToYear})</span>
                  </p>
                </li>
              ))}
            </ul>

            <div data-reveal className="mt-7 hidden md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/15 text-sm font-semibold text-primary-300">
                    <th scope="col" className="py-2.5 pr-4">Sector</th>
                    <th scope="col" className="px-4 py-2.5">{c.makeFromYear}</th>
                    <th scope="col" className="px-4 py-2.5">{c.makeToYear}</th>
                    <th scope="col" className="py-2.5 pl-4 text-right">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {c.makeRows.map((row, i) => (
                    <tr key={i} className="border-b border-white/10 text-[15px]">
                      <th scope="row" className="py-3 pr-4 font-medium text-white/90">{row.sector}</th>
                      <td className="px-4 py-3 tabular-nums text-white/70">{row.from}</td>
                      <td className="px-4 py-3 tabular-nums text-white/85">{row.to}</td>
                      <td className="py-3 pl-4 text-right font-semibold tabular-nums text-secondary-400">{row.growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {c.pli.map((p, i) => (
                <div key={i} data-reveal className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <dd className="text-2xl font-semibold leading-tight text-white">{p.value}</dd>
                  <dt className="mt-2 text-sm leading-snug text-white/65">{p.label}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-white/45">Sources: {c.makeSource}</p>
          </div>
        </div>
      </section>

      {/* ─── 05 Institutions ──────────────────────────────────── */}
      <section id="institutions" className="scroll-mt-20 border-t border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:px-10">
          <SectionHead id="institutions" title="Stable Political Environment" split>
            <p className={`mt-3 ${BODY}`}>
              India has been a functioning democracy since independence in 1947, with regular elections, peaceful
              transfers of power, a written constitution and an independent judiciary. Reform policy has shown
              continuity across governments.
            </p>
          </SectionHead>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STABILITY.map((s) => (
              <li key={s.title} data-reveal className={`${CARD} border-t-4 border-t-secondary-500 p-6 dark:border-t-secondary-500`}>
                <h3 className="text-lg font-semibold text-black dark:text-white">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-black/65 dark:text-white/65">{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── 06 Markets ───────────────────────────────────────── */}
      <section id="markets" className="scroll-mt-20 border-t border-black/5 bg-primary-50/40 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:px-10">
          <SectionHead id="markets" title="Financial Stock Market Performance" split>
            <RichText text={c.marketsText} paragraphs className={`mt-3 ${BODY}`} strongClass={STRONG} />
          </SectionHead>
          <ChartCard title={sensex.title} className="mt-7">
            <SensexLine points={sensex.points} latest={sensex.latest} />
          </ChartCard>
        </div>
      </section>

      {/* ─── 07 Global view ───────────────────────────────────── */}
      <section id="global" className="scroll-mt-20 border-t border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:px-10">
          <SectionHead id="global" title={c.indicesTitle} split>
            <p className={`mt-3 ${BODY}`}>{c.indicesSubtitle.replace(/\.?$/, '.')}</p>
          </SectionHead>
          <div className="mt-7 grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
            <div data-reveal className={`${CARD} bg-white p-5 dark:bg-white/[0.03] sm:p-6`}>
              <ChangeBars rows={c.indicesRows} />
            </div>
            <aside
              data-reveal
              className="rounded-3xl bg-gradient-to-br from-primary-50 to-secondary-50 p-6 ring-1 ring-primary-100 dark:from-primary-500/10 dark:to-secondary-500/10 dark:ring-white/10"
            >
              <h3 className="text-lg font-semibold text-black dark:text-white">In US-dollar terms</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/70 dark:text-white/70">{c.dollarTerms}</p>
            </aside>
          </div>
          <div data-reveal className="mt-4 space-y-1.5 text-xs leading-relaxed text-black/50 dark:text-white/50">
            <p className="text-black/60 dark:text-white/60">{c.indicesNote}</p>
            <p>{c.indicesLevels}</p>
          </div>
        </div>
      </section>

      {/* ─── 08 Portfolio ─────────────────────────────────────── */}
      <section id="portfolio" className="scroll-mt-20 border-t border-black/5 bg-primary-50/40 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:px-10">
          <SectionHead id="portfolio" title="Diversification & Risk Management" />
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIVERSIFICATION.map((d) => (
              <li key={d.title} data-reveal className={`${CARD} bg-white p-6 dark:bg-white/[0.03]`}>
                <h3 className="text-lg font-semibold text-black dark:text-white">{d.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-black/65 dark:text-white/65">{d.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Conclusion ───────────────────────────────────────── */}
      <section className="px-3 py-12 sm:px-5">
        <div data-reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#0b1826] px-6 py-10 text-white ring-1 ring-white/5 sm:px-12 lg:px-14">
          <RingMark
            count={4}
            from="var(--color-primary-500)"
            to="var(--color-secondary-500)"
            className="pointer-events-none absolute -bottom-48 -left-40 h-[440px] w-[440px] opacity-[0.08]"
          />
          <div className="relative">
            <Eyebrow className="text-primary-300">Conclusion</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-balance sm:text-4xl">
              A compelling <span className="text-secondary-400">long-term</span> opportunity
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/75">{c.conclusion}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href="/nri/why-invest-in-india#contact"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-7 py-3 text-[15px] font-semibold text-white shadow-md shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Talk to us
              </Link>
              <Link
                href="/nri#guide"
                className="group inline-flex items-center gap-2 text-[15px] font-semibold text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Read the NRI investment guide
                <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GetInTouch />

      {/* ─── Disclaimer ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-6 lg:px-10">
        <p className="border-t border-black/10 pt-6 text-xs leading-relaxed text-black/50 dark:border-white/10 dark:text-white/50">
          Krold Mfins Private Limited is an AMFI-registered Mutual Fund Distributor. The figures on this page were
          checked in {c.asOf} and are given for general information only; they are not investment advice. Past
          performance does not guarantee future returns. Mutual fund investments are subject to market risks; read all
          scheme-related documents carefully before investing.
        </p>
      </section>
    </main>
  )
}
