// Describes every figure the Site data portal (/admin/content) can edit: which page and
// section it appears in, what to call it, and what kind of value it is. The admin screen is
// drawn from this, and the server uses it to check what is saved, so a field added here
// shows up in both. Shared by the server and the browser, so no Node imports here.
//
// Field types: text (one line), textarea (several lines; **like this** makes words bold),
// number, date, url (a web address), toggle, and list (rows of sub-fields). A list with
// `fixed: true` keeps its number of rows, because the design on the site is built for exactly that many.

const BOLD_HELP = 'Put **two stars** either side of words to make them bold. Start a new line for a new paragraph.'

// Where a figure comes from: each source is a name shown on the site, linked to the page it
// was taken from, so readers (and compliance) can check the number for themselves.
const sources = (key, label = 'Sources') => ({
  key,
  type: 'list',
  label,
  itemLabel: 'Source',
  titleKey: 'label',
  max: 10,
  help: 'Give each source a short name and the link to the exact page the figure was taken from (an official publication where possible). The name is shown on the site and opens the link. Leave the link empty if there is no web page.',
  fields: [
    { key: 'label', label: 'Name shown on the site', type: 'text', placeholder: 'IMF World Economic Outlook, Oct 2026' },
    { key: 'url', label: 'Link', type: 'url', placeholder: 'https://' },
  ],
})

export const CONTENT_PAGES = [
  {
    id: 'home',
    title: 'Home page',
    path: '/',
    sections: [
      {
        id: 'heroStats',
        title: 'Headline numbers in the top banner',
        where: 'The three figures under the main heading at the very top of the home page.',
        link: '/#home',
        fields: [
          {
            key: 'heroStats',
            type: 'list',
            fixed: true,
            itemLabel: 'Figure',
            fields: [
              { key: 'value', label: 'Number', type: 'text', placeholder: '₹300Cr+' },
              { key: 'label', label: 'Caption under the number', type: 'text', placeholder: 'Assets Under Management' },
            ],
          },
        ],
      },
      {
        id: 'happyClients',
        title: 'Happy clients counter',
        where: 'The big counting number beside the client testimonials. It appears on the home page and on the NRI page.',
        link: '/#testimonials',
        fields: [
          {
            key: 'happyClients',
            label: 'Number of happy clients',
            type: 'number',
            help: 'A whole number. The site adds the “+” after it and counts up to it.',
            min: 0,
          },
        ],
      },
    ],
  },

  {
    id: 'about',
    title: 'About page',
    path: '/about',
    sections: [
      {
        id: 'founderYears',
        title: 'Founder’s years of experience',
        where: 'The “25+ years in wealth management” badge on the founder’s photo, and the sentence “With over 25 years of experience…” beside it.',
        link: '/about#founder',
        fields: [
          { key: 'founderYears', label: 'Years of experience', type: 'number', help: 'A whole number. Updates both places at once.', min: 0 },
        ],
      },
    ],
  },

  {
    id: 'nri',
    title: 'NRI page',
    path: '/nri',
    sections: [
      {
        id: 'checked',
        title: 'When the figures were last checked',
        where: 'Shown above the tax table (“Rates for Tax Year 2026-27, checked October 2026”) and in the small print at the bottom of the NRI page.',
        link: '/nri#tax',
        fields: [
          { key: 'asOf', label: 'Checked in (month and year)', type: 'text', placeholder: 'October 2026' },
          { key: 'taxYear', label: 'Tax year the rates are for', type: 'text', placeholder: 'Tax Year 2026-27' },
        ],
      },
      {
        id: 'heroStats',
        title: 'Four headline figure cards',
        where: 'The four cards just below the top banner of the NRI page (economy size, GDP growth, remittances, working-age population).',
        link: '/nri',
        fields: [
          {
            key: 'heroStats',
            type: 'list',
            fixed: true,
            itemLabel: 'Card',
            fields: [
              { key: 'badge', label: 'Small badge at the top', type: 'text' },
              { key: 'value', label: 'Big number', type: 'text', placeholder: '$4.06T' },
              { key: 'label', label: 'What the number is', type: 'text' },
              { key: 'note', label: 'Explanation', type: 'textarea' },
              sources('sources', 'Sources (small print on the card)'),
            ],
          },
        ],
      },
      {
        id: 'accounts',
        title: 'NRE, NRO and FCNR(B) accounts table',
        where: 'The comparison table in the “Investment guide” part of the NRI page.',
        link: '/nri#accounts',
        fields: [
          {
            key: 'accounts',
            type: 'list',
            fixed: true,
            itemLabel: 'Account',
            titleKey: 'name',
            fields: [
              { key: 'name', label: 'Short name', type: 'text' },
              { key: 'full', label: 'Full name', type: 'text' },
              { key: 'currency', label: 'Held in', type: 'text' },
              { key: 'holds', label: 'What it holds', type: 'text' },
              { key: 'repatriation', label: 'Taking money abroad', type: 'text' },
              { key: 'tax', label: 'Tax on interest', type: 'text' },
              { key: 'fx', label: 'Exchange-rate risk', type: 'text' },
            ],
          },
          sources('accountsSources', 'Sources under the table'),
        ],
      },
      {
        id: 'capitalGains',
        title: 'Capital gains tax table',
        where: 'The “Tax at a glance” table on the NRI page: one row per type of investment.',
        link: '/nri#tax',
        fields: [
          {
            key: 'capitalGains',
            type: 'list',
            itemLabel: 'Row',
            titleKey: 'asset',
            min: 1,
            fields: [
              { key: 'asset', label: 'Investment', type: 'text' },
              { key: 'short', label: 'Short-term rate', type: 'text' },
              { key: 'long', label: 'Long-term rate', type: 'text' },
              {
                key: 'both',
                label: 'One rate for both (optional)',
                type: 'text',
                help: 'Fill this only when short and long term are taxed the same way. It replaces both columns for this row.',
              },
            ],
          },
          { key: 'capitalGainsNote', label: 'Note under the table', type: 'textarea' },
        ],
      },
      {
        id: 'taxSide',
        title: 'Tax treaties, exempt income and tax sources',
        where: 'The blue “Avoiding double tax” box, the “Exempt income” list beside the tax table, and the sources under the whole tax section.',
        link: '/nri#tax',
        fields: [
          { key: 'treatyCountries', label: 'Number of countries with a tax treaty', type: 'text', placeholder: '85+' },
          {
            key: 'exemptIncome',
            type: 'list',
            label: 'Exempt income points',
            itemLabel: 'Point',
            min: 1,
            fields: [{ key: 'text', label: 'Text', type: 'textarea' }],
          },
          sources('taxSources', 'Sources for the tax rates and rules'),
        ],
      },
      {
        id: 'giftCity',
        title: 'GIFT City figures',
        where: 'The three figures on the dark GIFT City panel with their sources, and the small print at the bottom of that section.',
        link: '/nri#gift-city',
        fields: [
          {
            key: 'giftStats',
            type: 'list',
            fixed: true,
            itemLabel: 'Figure',
            fields: [
              { key: 'value', label: 'Number', type: 'text', placeholder: '$111B' },
              { key: 'label', label: 'What it is', type: 'text' },
            ],
          },
          sources('giftSources', 'Sources under the figures'),
          { key: 'giftNote', label: 'Small print at the bottom of the section', type: 'textarea' },
        ],
      },
      {
        id: 'faq',
        title: 'Frequently asked questions',
        where: 'The FAQ at the bottom of the NRI page. Each group is one of the tabs (Bank accounts, Mutual funds, Tax, Residency).',
        link: '/nri#faq',
        fields: [
          {
            key: 'faq',
            type: 'list',
            fixed: true,
            itemLabel: 'Tab',
            titleKey: 'label',
            collapsed: true,
            fields: [
              { key: 'label', label: 'Tab name', type: 'text' },
              {
                key: 'items',
                type: 'list',
                label: 'Questions in this tab',
                itemLabel: 'Question',
                titleKey: 'q',
                min: 1,
                fields: [
                  { key: 'q', label: 'Question', type: 'text' },
                  {
                    key: 'a',
                    label: 'Answer',
                    type: 'textarea',
                    help: 'To show the answer as bullet points, put each point on its own line.',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'whyIndia',
    title: 'Why invest in India',
    path: '/nri/why-invest-in-india',
    sections: [
      {
        id: 'intro',
        title: 'Introduction and “checked” date',
        where: 'The paragraph under the main heading at the top of the page, and the date in the small print at the bottom.',
        link: '/nri/why-invest-in-india',
        fields: [
          { key: 'intro', label: 'Introduction paragraph', type: 'textarea' },
          { key: 'asOf', label: 'Figures checked in (month and year)', type: 'text', placeholder: 'October 2026' },
        ],
      },
      {
        id: 'economy',
        title: '01 · Economy: GDP growth',
        where: 'Section 01 “Robust Economic Growth”: the text on the left and the bar chart on the right.',
        link: '/nri/why-invest-in-india#economy',
        fields: [
          { key: 'economyText', label: 'Text', type: 'textarea', help: BOLD_HELP, rows: 6 },
          sources('economySources', 'Sources under the text'),
          { key: 'gdpTitle', label: 'Chart title', type: 'text' },
          {
            key: 'gdpBars',
            type: 'list',
            label: 'Chart bars',
            itemLabel: 'Bar',
            titleKey: 'label',
            min: 1,
            max: 8,
            fields: [
              { key: 'label', label: 'Country', type: 'text' },
              { key: 'value', label: 'Growth (%)', type: 'number', step: 0.1, help: 'Just the number, e.g. 7.0' },
              { key: 'highlight', label: 'Highlight this bar', type: 'toggle' },
            ],
          },
          sources('gdpSources', 'Chart sources'),
        ],
      },
      {
        id: 'people',
        title: '02 · People: demographics',
        where: 'Section 02 “Demographic Dividend”: the text, the four figure cards and the age-group bar.',
        link: '/nri/why-invest-in-india#people',
        fields: [
          { key: 'peopleText', label: 'Text', type: 'textarea', help: BOLD_HELP, rows: 5 },
          {
            key: 'peopleStats',
            type: 'list',
            label: 'Figure cards',
            fixed: true,
            itemLabel: 'Card',
            fields: [
              { key: 'value', label: 'Number', type: 'text', placeholder: '29.2 yrs' },
              { key: 'label', label: 'What it is', type: 'text' },
            ],
          },
          { key: 'ageTitle', label: 'Age-group chart title', type: 'text' },
          {
            key: 'ageGroups',
            type: 'list',
            label: 'Age groups (youngest first)',
            fixed: true,
            itemLabel: 'Group',
            titleKey: 'label',
            fields: [
              { key: 'label', label: 'Age group', type: 'text' },
              { key: 'people', label: 'Number of people', type: 'text', placeholder: '351 mn' },
              { key: 'share', label: 'Share of population (%)', type: 'number', step: 0.1, help: 'The four shares should add up to 100.' },
            ],
          },
          sources('ageSources', 'Sources for this section (shown under the age-group chart)'),
        ],
      },
      {
        id: 'digital',
        title: '03 · Digital: UPI payments',
        where: 'Section 03 “Digital Transformation”: the text and the UPI bar chart.',
        link: '/nri/why-invest-in-india#digital',
        fields: [
          { key: 'digitalText', label: 'Text', type: 'textarea', help: BOLD_HELP, rows: 5 },
          { key: 'upiTitle', label: 'Chart title', type: 'text' },
          {
            key: 'upiBars',
            type: 'list',
            label: 'Chart bars (one per year)',
            itemLabel: 'Year',
            titleKey: 'label',
            min: 1,
            max: 10,
            fields: [
              { key: 'label', label: 'Year', type: 'text', placeholder: 'FY26' },
              { key: 'value', label: 'Transactions (billion)', type: 'number', step: 0.1 },
              { key: 'worth', label: 'Value', type: 'text', placeholder: '₹314 L cr' },
              { key: 'highlight', label: 'Highlight this bar', type: 'toggle' },
            ],
          },
          sources('upiSources', 'Sources for the text and chart'),
        ],
      },
      {
        id: 'makeInIndia',
        title: '04 · Make in India',
        where: 'Section 04, the dark panel “From importer to manufacturing hub”: the text, the sector table and the four PLI figures.',
        link: '/nri/why-invest-in-india#make-in-india',
        fields: [
          { key: 'makeText', label: 'Text', type: 'textarea', rows: 4 },
          { key: 'makeFromYear', label: 'Table: earlier year column', type: 'text', placeholder: 'FY 2014-15' },
          { key: 'makeToYear', label: 'Table: latest year column', type: 'text', placeholder: 'FY 2025-26' },
          {
            key: 'makeRows',
            type: 'list',
            label: 'Table rows',
            itemLabel: 'Sector',
            titleKey: 'sector',
            min: 1,
            fields: [
              { key: 'sector', label: 'Sector', type: 'text' },
              { key: 'from', label: 'Earlier year', type: 'text' },
              { key: 'to', label: 'Latest year', type: 'text' },
              { key: 'growth', label: 'Growth', type: 'text', placeholder: '≈6.9×' },
            ],
          },
          {
            key: 'pli',
            type: 'list',
            label: 'PLI figures',
            fixed: true,
            itemLabel: 'Figure',
            fields: [
              { key: 'value', label: 'Number', type: 'text' },
              { key: 'label', label: 'What it is', type: 'text' },
            ],
          },
          sources('makeSources'),
        ],
      },
      {
        id: 'markets',
        title: '06 · Markets: Sensex chart',
        where: 'Section 06 “Financial Stock Market Performance”: the text, the Sensex line chart and its sources.',
        link: '/nri/why-invest-in-india#markets',
        fields: [
          { key: 'marketsText', label: 'Text', type: 'textarea', help: BOLD_HELP, rows: 5 },
          {
            key: 'sensexLatestValue',
            label: 'Latest Sensex level (the dashed end of the line)',
            type: 'number',
            min: 0,
          },
          {
            key: 'sensexLatestDate',
            label: 'Date of that level',
            type: 'date',
            help: 'Pick a date in the year after the last year-end close below. The chart title updates by itself.',
          },
          {
            key: 'sensexPoints',
            type: 'list',
            label: 'Year-end closes (oldest first)',
            itemLabel: 'Year',
            titleKey: 'year',
            compact: true,
            min: 2,
            fields: [
              { key: 'year', label: 'Year', type: 'number', min: 1900 },
              { key: 'close', label: 'Sensex at year end', type: 'number', min: 0 },
            ],
          },
          sources('sensexSources', 'Chart sources'),
        ],
      },
      {
        id: 'global',
        title: '07 · Global view: Sensex vs world indices',
        where: 'Section 07: the heading, the bar comparison of world indices, the “In US-dollar terms” box, the small print and its sources.',
        link: '/nri/why-invest-in-india#global',
        fields: [
          { key: 'indicesTitle', label: 'Section heading', type: 'text' },
          { key: 'indicesSubtitle', label: 'Line under the heading', type: 'text' },
          {
            key: 'indicesRows',
            type: 'list',
            label: 'Indices',
            itemLabel: 'Index',
            titleKey: 'name',
            min: 1,
            max: 8,
            fields: [
              { key: 'name', label: 'Index', type: 'text' },
              { key: 'change', label: 'Total change (%)', type: 'number', help: 'Just the number, e.g. 2046' },
              { key: 'cagr', label: 'Per year (CAGR)', type: 'text', placeholder: '13.1%' },
              { key: 'highlight', label: 'Highlight this bar', type: 'toggle' },
            ],
          },
          { key: 'dollarTerms', label: '“In US-dollar terms” box', type: 'textarea' },
          { key: 'indicesNote', label: 'Note under the chart', type: 'textarea' },
          { key: 'indicesLevels', label: 'Index levels (small print)', type: 'textarea' },
          sources('indicesSources', 'Sources for the index levels and exchange rate'),
        ],
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        where: 'The dark “A compelling long-term opportunity” panel near the bottom of the page.',
        link: '/nri/why-invest-in-india',
        fields: [{ key: 'conclusion', label: 'Text', type: 'textarea' }],
      },
    ],
  },
]

/* ─── Checking what is saved ─────────────────────────────────────── */

export class ContentError extends Error {}

const MAX_TEXT = { text: 400, textarea: 6000, url: 1000 }
const MAX_ROWS = 100

function cleanValue(field, value, fallback, where) {
  const name = `${where}${field.label ? ` → ${field.label}` : ''}`
  switch (field.type) {
    case 'text':
    case 'textarea':
      return String(value ?? '').replace(/\r\n/g, '\n').trim().slice(0, MAX_TEXT[field.type])
    case 'number': {
      const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(/,/g, '').trim())
      if (value === '' || value == null || !Number.isFinite(n)) throw new ContentError(`${name}: please enter a number.`)
      if (field.min != null && n < field.min) throw new ContentError(`${name}: must be at least ${field.min}.`)
      return n
    }
    case 'url': {
      const url = String(value ?? '').trim()
      // Only ordinary web links, so nothing like javascript: can be saved and shown as a link.
      if (url && !/^https?:\/\/[^\s<>"]+$/i.test(url)) {
        throw new ContentError(`${name}: please enter a full web address starting with https://`)
      }
      return url.slice(0, MAX_TEXT.url)
    }
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value)) || Number.isNaN(Date.parse(value))) {
        throw new ContentError(`${name}: please pick a date.`)
      }
      return String(value)
    case 'toggle':
      return Boolean(value)
    case 'list': {
      if (!Array.isArray(value)) throw new ContentError(`${name}: the list is missing.`)
      const defaults = Array.isArray(fallback) ? fallback : []
      if (field.fixed && value.length !== defaults.length) {
        throw new ContentError(`${name}: must have exactly ${defaults.length} ${field.itemLabel.toLowerCase()}s.`)
      }
      const min = field.min ?? 0
      const max = field.fixed ? defaults.length : field.max ?? MAX_ROWS
      if (value.length < min) throw new ContentError(`${name}: needs at least ${min} ${field.itemLabel.toLowerCase()}.`)
      if (value.length > max) throw new ContentError(`${name}: can have at most ${max} ${field.itemLabel.toLowerCase()}s.`)
      return value.map((item, i) => {
        const base = field.fixed ? defaults[i] : {}
        const label = `${where} → ${field.itemLabel} ${i + 1}`
        const out = { ...base }
        for (const sub of field.fields) out[sub.key] = cleanValue(sub, item?.[sub.key], base?.[sub.key], label)
        return out
      })
    }
    default:
      throw new ContentError(`Unknown field type: ${field.type}`)
  }
}

// Returns a complete, checked copy of the content: every field in the schema, with anything
// missing from `input` taken from `defaults`. Throws ContentError naming the field at fault.
export function cleanContent(input, defaults) {
  const out = structuredClone(defaults)
  for (const page of CONTENT_PAGES) {
    const given = input?.[page.id] ?? {}
    for (const section of page.sections) {
      for (const field of section.fields) {
        if (!(field.key in given)) continue
        out[page.id][field.key] = cleanValue(field, given[field.key], defaults[page.id][field.key], `${page.title} → ${section.title}`)
      }
    }
  }
  return out
}

// Fills in anything a stored copy lacks (a field added since it was saved) from the defaults,
// without throwing: a stored copy that fails the checks falls back field by field.
export function withDefaults(stored, defaults) {
  const out = structuredClone(defaults)
  if (!stored || typeof stored !== 'object') return out
  for (const page of CONTENT_PAGES) {
    for (const section of page.sections) {
      for (const field of section.fields) {
        const value = stored[page.id]?.[field.key]
        if (value === undefined) continue
        try {
          out[page.id][field.key] = cleanValue(field, value, defaults[page.id][field.key], '')
        } catch {
          // keep the default
        }
      }
    }
  }
  return out
}
