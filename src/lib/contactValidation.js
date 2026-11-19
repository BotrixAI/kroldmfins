// Field rules for the contact form, shared by the form (instant feedback) and /api/contact (the real check).
import { getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'

export const DEFAULT_COUNTRY = 'IN'

// Letters from any alphabet, with the spaces, dots, apostrophes and hyphens names use ("Mary-Jane O'Neil Jr.").
export const NAME_PATTERN = /^\p{L}[\p{L}\p{M}\s.'-]*$/u
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/
// Indian mobile numbers: 10 digits starting with 6, 7, 8 or 9.
export const INDIA_PHONE_PATTERN = /^[6-9]\d{9}$/

let countries
// Every country with its calling code and English name, sorted by name (India first, as the default).
export function getCountryOptions() {
  if (countries) return countries
  const names = new Intl.DisplayNames(['en'], { type: 'region' })
  countries = getCountries()
    .map((iso) => ({ iso, name: names.of(iso) || iso, dialCode: `+${getCountryCallingCode(iso)}` }))
    .sort((a, b) => (a.iso === DEFAULT_COUNTRY ? -1 : b.iso === DEFAULT_COUNTRY ? 1 : a.name.localeCompare(b.name)))
  return countries
}

export const isKnownCountry = (iso) => getCountries().includes(iso)

// The longest national number the field accepts for a country.
export const phoneMaxDigits = (iso) => (iso === 'IN' ? 10 : 15)

export function validateName(value) {
  const v = value.trim()
  if (!v) return 'Please enter your name.'
  if (v.length < 2) return 'Name must be at least 2 characters.'
  if (!NAME_PATTERN.test(v)) return 'Name can only contain letters, spaces, dots, hyphens and apostrophes.'
  return ''
}

export function validateEmail(value) {
  const v = value.trim()
  if (!v) return 'Please enter your email.'
  if (!EMAIL_PATTERN.test(v)) return 'Please enter a valid email address.'
  return ''
}

export function validatePhone(digits, iso) {
  const v = digits.replace(/\D/g, '')
  if (!v) return 'Please enter your phone number.'
  if (!isKnownCountry(iso)) return 'Please choose a country code.'
  if (iso === 'IN') {
    return INDIA_PHONE_PATTERN.test(v) ? '' : 'Indian mobile numbers are 10 digits and start with 6, 7, 8 or 9.'
  }
  return isValidPhoneNumber(v, iso) ? '' : 'Please enter a valid phone number for the selected country.'
}

// The number as it is stored and emailed, e.g. "+91 98765 43210".
export function formatPhone(digits, iso) {
  return parsePhoneNumber(digits.replace(/\D/g, ''), iso).formatInternational()
}
