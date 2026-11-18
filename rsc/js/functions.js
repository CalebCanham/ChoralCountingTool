import { Fraction, Polynomial } from './classes.js'
export { generateData, validateSettings, MAX_ROWS, MAX_COLUMNS }

const MAX_ROWS = 100
const MAX_COLUMNS = 30
const MAX_DECIMAL_PLACES = 6

const INTEGER_RE = /^-?\d+$/
const DECIMAL_RE = /^-?(?:\d+\.?\d*|\.\d+)$/
const FRACTION_RE = /^-?(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+)$/
const POLYNOMIAL_RE = /^[0-9a-z+\-^.\s]+$/i

// ======================================================================================
// Validation
// ======================================================================================

// Returns { status: 'ok' | 'incomplete' | 'invalid', message }
//   incomplete = the user just hasn't finished filling things in yet
//   invalid    = something was entered that can't be turned into a count
const validateSettings = (s) => {
    const missing = []
    if (!s.type) missing.push('a number type')
    if (!s.start) missing.push('a starting number')
    if (!s.interval) missing.push('an interval')
    if (!s.rows) missing.push('the number of rows')
    if (!s.cols) missing.push('the number of columns')

    if (missing.length) {
        return { status: 'incomplete', message: `Add ${joinList(missing)} to see your table.` }
    }

    const rows = Number(s.rows)
    const cols = Number(s.cols)
    if (!Number.isInteger(rows) || rows < 1 || rows > MAX_ROWS) {
        return invalid(`Rows must be a whole number from 1 to ${MAX_ROWS}.`)
    }
    if (!Number.isInteger(cols) || cols < 1 || cols > MAX_COLUMNS) {
        return invalid(`Columns must be a whole number from 1 to ${MAX_COLUMNS}.`)
    }

    switch (s.type) {
        case 'Integer':
            if (!INTEGER_RE.test(s.start) || !INTEGER_RE.test(s.interval)) {
                return invalid('Integer counts need whole numbers, like 5 or -3. Choose Decimal for values like 0.25.')
            }
            break

        case 'Decimal':
            if (!DECIMAL_RE.test(s.start) || !DECIMAL_RE.test(s.interval)) {
                return invalid('Decimal counts need numbers like 0.25 or 3.')
            }
            break

        case 'Fraction':
            if (!FRACTION_RE.test(s.start) || !FRACTION_RE.test(s.interval)) {
                return invalid('Fractions look like 1/4, 3 or 1 1/2.')
            }
            try {
                Fraction.fromString(s.start, false)
                Fraction.fromString(s.interval, false)
            } catch (e) {
                return invalid('A fraction cannot have 0 as its denominator.')
            }
            break

        case 'Polynomial': {
            if (!POLYNOMIAL_RE.test(s.start) || !POLYNOMIAL_RE.test(s.interval)) {
                return invalid('Expressions can use numbers, one letter, + and -, like 2n+2 or x^2.')
            }
            const letters = new Set(`${s.start}${s.interval}`.toLowerCase().match(/[a-z]/g) || [])
            if (letters.size > 1) {
                return invalid('Use a single variable letter in both boxes (for example n).')
            }
            const parsed = [new Polynomial(s.start), new Polynomial(s.interval)]
            if (parsed.some(p => p.coefficients.some(c => !Number.isFinite(c)))) {
                return invalid('That expression could not be read. Try something like 2n+2.')
            }
            break
        }

        default:
            return invalid('Choose a number type.')
    }

    return { status: 'ok', message: '' }
}

const invalid = (message) => ({ status: 'invalid', message })

const joinList = (items) => {
    if (items.length <= 1) return items.join('')
    if (items.length === 2) return `${items[0]} and ${items[1]}`
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

// ======================================================================================
// Generation
// ======================================================================================

// settings = { type, start, interval, mode: 'increment' | 'decrement', rows, cols,
//              fractionType: 'improper' | 'mixed', fractionForm: 'simplified' | 'unsimplified',
//              decimals: 'minimal' | 'consistent' }
const generateData = (s) => {
    const length = Number(s.rows) * Number(s.cols)
    const sign = s.mode === 'decrement' ? -1 : 1

    switch (s.type) {
        case 'Integer':
            return decimalSequence(s.start, s.interval, sign, length, false)

        case 'Decimal':
            return decimalSequence(s.start, s.interval, sign, length, s.decimals === 'consistent')

        case 'Fraction':
            return fractionSequence(s.start, s.interval, sign, length,
                s.fractionType === 'mixed', s.fractionForm === 'unsimplified')

        case 'Polynomial':
            return polynomialSequence(s.start, s.interval, sign, length)

        default:
            return []
    }
}

// Works in scaled integers so 0.1 + 0.2 style floating point noise can never show up.
const decimalSequence = (start, interval, sign, length, consistent) => {
    const countDecimals = (value) => {
        const match = String(value).trim().match(/\.(\d+)$/)
        return match ? match[1].length : 0
    }

    const places = Math.min(MAX_DECIMAL_PLACES, Math.max(countDecimals(start), countDecimals(interval)))
    const scale = 10 ** places
    const startScaled = Math.round(Number(start) * scale)
    const stepScaled = Math.round(Number(interval) * scale)

    const out = []
    for (let i = 0; i < length; i++) {
        const value = (startScaled + sign * i * stepScaled) / scale
        let text = value.toFixed(places)
        if (places > 0 && !consistent) {
            text = text.replace(/\.?0+$/, '')
        }
        out.push(text === '-0' ? '0' : text)
    }
    return out
}

const gcd = (a, b) => {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b) [a, b] = [b, a % b]
    return a
}

const lcm = (a, b) => (a / gcd(a, b)) * b

// Every value is kept as (numerator / common denominator). Simplified form reduces each one
// on its own; unsimplified form leaves the shared denominator alone (1/4, 2/4, 3/4, 4/4 ...).
const fractionSequence = (start, interval, sign, length, mixed, unsimplified) => {
    const a = Fraction.fromString(start, false)
    const b = Fraction.fromString(interval, false)

    const denominator = lcm(a.denominator, b.denominator)
    const base = a.numerator * (denominator / a.denominator)
    const step = sign * b.numerator * (denominator / b.denominator)

    const out = []
    for (let i = 0; i < length; i++) {
        out.push(formatFraction(base + i * step, denominator, mixed, unsimplified))
    }
    return out
}

const formatFraction = (numerator, denominator, mixed, unsimplified) => {
    if (!unsimplified) {
        const divisor = gcd(numerator, denominator) || 1
        numerator /= divisor
        denominator /= divisor
    }

    const sign = numerator < 0 ? '-' : ''
    const abs = Math.abs(numerator)

    if (mixed) {
        const whole = Math.floor(abs / denominator)
        const remainder = abs % denominator
        if (remainder === 0) return `${sign}${whole}`
        if (whole === 0) return `${sign}${remainder}/${denominator}`
        return `${sign}${whole} ${remainder}/${denominator}`
    }

    if (denominator === 1) return `${numerator}`
    return `${numerator}/${denominator}`
}

const polynomialSequence = (start, interval, sign, length) => {
    let current = new Polynomial(start)
    const step = new Polynomial(interval)

    const out = []
    for (let i = 0; i < length; i++) {
        out.push(current.toString())
        current = sign > 0 ? current.add(step) : current.subtract(step)
    }
    return out
}
