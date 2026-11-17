// The site's figures as written in src/data. They are what the site shows until an admin
// saves changes in the Site data portal (/admin/content), and what "Restore original"
// puts back. Shared by the server and the browser, so no Node imports here.
import * as NRI from '../../data/nri'
import * as WHY from '../../data/whyIndia'
import { HAPPY_CLIENTS_COUNT } from '../../data/testimonials'

// Arrays of bullet points are edited as one box, one point per line.
const lines = (value) => (Array.isArray(value) ? value.join('\n') : value)

// The day of the latest Sensex level on the chart (WHY.SENSEX.latest.label), as yyyy-mm-dd.
const SENSEX_LATEST_DATE = '2026-10-13'

export const DEFAULT_CONTENT = {
  home: {
    heroStats: [
      { value: '₹300Cr+', label: 'Assets Under Management' },
      { value: '200+', label: 'Families Served' },
      { value: '10+', label: 'Years of Trust' },
    ],
    happyClients: HAPPY_CLIENTS_COUNT,
  },

  about: {
    founderYears: 25,
  },

  nri: {
    asOf: NRI.AS_OF,
    taxYear: NRI.TAX_YEAR,
    heroStats: NRI.HERO_STATS.map(({ badge, value, label, note, sources }) => ({ badge, value, label, note, sources })),
    accounts: NRI.ACCOUNTS.map(({ key, name, full, rows }) => ({ key, name, full, ...rows })),
    accountsSources: NRI.ACCOUNT_SOURCES,
    capitalGains: NRI.CAPITAL_GAINS.rows.map(({ asset, short = '', long = '', both = '' }) => ({ asset, short, long, both })),
    capitalGainsNote: `${NRI.CAPITAL_GAINS.note} Surcharge, where applicable, and 4% health and education cess are added to all rates.`,
    treatyCountries: '85+',
    exemptIncome: NRI.EXEMPT_INCOME.map((text) => ({ text })),
    taxSources: NRI.TAX_SOURCES,
    giftStats: NRI.GIFT_CITY.stats.map(({ value, label }) => ({ value, label })),
    giftSources: NRI.GIFT_CITY.sources,
    giftNote: NRI.GIFT_CITY.note,
    faq: NRI.FAQ_GROUPS.map(({ key, label, items }) => ({ key, label, items: items.map(({ q, a }) => ({ q, a: lines(a) })) })),
  },

  whyIndia: {
    asOf: WHY.AS_OF,
    intro: WHY.INTRO,

    economyText:
      'India’s economy grew an estimated **7.7% in FY 2025-26**, according to official provisional estimates. In its October 2026 World Economic Outlook, the IMF raised India’s 2026 forecast to **7.0%**, 0.6 percentage points above its July estimate, citing resilient domestic demand and strong services activity.\n' +
      'That is more than twice the projected world growth rate of 3.1%, even as the global economy contends with a Middle East conflict and higher energy prices. Measured at purchasing power, India accounts for about 8.6% of world GDP in 2026.',
    economySources: WHY.GDP_GROWTH.textSources,
    gdpTitle: WHY.GDP_GROWTH.title,
    gdpBars: WHY.GDP_GROWTH.bars.map(({ label, value, highlight = false }) => ({ label, value, highlight })),
    gdpSources: WHY.GDP_GROWTH.sources,

    peopleText:
      'India has the world’s largest population and one of its youngest workforces. About **58% of Indians are under 35**, and the working-age share is still rising. The Economic Survey 2023-24 estimates India must create nearly **7.85 million non-farm jobs every year until 2030** to absorb its growing workforce: a large, expanding pool of talent and consumers.',
    peopleStats: WHY.PEOPLE_STATS.map(({ value, label }) => ({ value, label })),
    ageTitle: WHY.AGE_GROUPS.title,
    ageGroups: WHY.AGE_GROUPS.groups.map(({ label, people, share }) => ({ label, people, share })),
    ageSources: WHY.AGE_GROUPS.sources,

    digitalText:
      'The Unified Payments Interface (UPI) has made India the world leader in real-time digital payments. In ten years, annual UPI transactions grew more than **13,000-fold**, from 1.78 crore in FY 2016-17 to more than **24,162 crore in FY 2025-26**, worth about **₹314 lakh crore**. According to the Ministry of Finance, UPI accounts for about **49% of real-time payment transactions worldwide**.',
    upiTitle: WHY.UPI.title,
    upiBars: WHY.UPI.bars.map(({ label, value, worth = '', highlight = false }) => ({ label, value, worth, highlight })),
    upiSources: WHY.UPI.sources,

    makeText:
      'Launched in September 2014 and backed since 2020 by Production Linked Incentive (PLI) schemes across 14 sectors, Make in India has transformed electronics and defence manufacturing. India is now the world’s second-largest mobile phone maker, and mobile phones have become its largest export item.',
    makeFromYear: 'FY 2014-15',
    makeToYear: 'FY 2025-26',
    makeRows: WHY.MAKE_IN_INDIA.rows.map(({ sector, from, to, growth }) => ({ sector, from, to, growth })),
    pli: WHY.MAKE_IN_INDIA.pli.map(({ value, label }) => ({ value, label })),
    makeSources: WHY.MAKE_IN_INDIA.sources,

    marketsText:
      'Over the long run, Indian equities have compounded at double-digit rates. The Sensex rose from 3,972 at the end of 2000 to 85,221 at the end of 2025. Markets are volatile, though: 2026 has been a difficult year, with the Sensex down about 14% from its 2025 close as of mid-October, amid foreign investor outflows, higher energy prices and global uncertainty.',
    sensexPoints: WHY.SENSEX.points.map(([year, close]) => ({ year, close })),
    sensexLatestDate: SENSEX_LATEST_DATE,
    sensexLatestValue: WHY.SENSEX.latest.value,
    sensexSources: WHY.SENSEX.sources,

    indicesTitle: WHY.INDICES.title,
    indicesSubtitle: WHY.INDICES.subtitle,
    indicesRows: WHY.INDICES.rows.map(({ name, change, cagr, highlight = false }) => ({ name, change, cagr, highlight })),
    dollarTerms: WHY.DOLLAR_TERMS,
    indicesNote: WHY.INDICES.note,
    indicesLevels: WHY.INDICES.levels,
    indicesSources: WHY.INDICES.sources,

    conclusion: WHY.CONCLUSION,
  },
}
