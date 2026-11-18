export { CustomTable, Fraction, Polynomial }

// Matches "3/4", "-3/4", "1 3/4" and "-1 3/4"
const FRACTION_RE = /^(-?)(?:(\d+)\s+)?(\d+)\/(\d+)$/

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const formatInteger = (digits) => {
  const n = Number(digits)
  return Number.isFinite(n) ? new Intl.NumberFormat('en-US').format(n) : digits
}

// Adds thousands separators to plain integers / decimals ("12500.5" -> "12,500.5").
// Returns null when the value is not a plain number.
const formatNumberForDisplay = (value) => {
  const trimmed = String(value).trim()
  if (!/^-?\d+(?:\.\d+)?$/.test(trimmed)) return null

  const isNegative = trimmed.startsWith('-')
  const [intPart, fracPart = ''] = trimmed.replace(/^-/, '').split('.')
  const formattedInt = formatInteger(intPart)
  return `${isNegative ? '-' : ''}${formattedInt}${fracPart ? '.' + fracPart : ''}`
}

// Replace ^... with superscript. Supports numbers, simple identifiers, and parenthesized expressions.
// Operates on escaped text so raw HTML can never be injected.
const replaceCaretWithSup = (s) => escapeHtml(s).replace(
  /\^(-?\d+|\([^)]+\)|[a-zA-Z]+)/g,
  (_, grp) => `<sup>${grp}</sup>`
)

const cellHTML = (raw) => {
  const text = (raw instanceof Fraction ? raw.toString() : String(raw ?? '')).trim()
  if (text === '') return ''

  const fraction = text.match(FRACTION_RE)
  if (fraction) {
    const [, negative, whole, numerator, denominator] = fraction
    return '<span class="cc-mixed">' +
      (negative ? '<span class="cc-sign">-</span>' : '') +
      (whole ? `<span class="cc-whole">${formatInteger(whole)}</span>` : '') +
      '<span class="cc-frac">' +
        `<span>${escapeHtml(numerator)}</span>` +
        '<span class="cc-bar"></span>' +
        `<span>${escapeHtml(denominator)}</span>` +
      '</span>' +
    '</span>'
  }

  return replaceCaretWithSup(formatNumberForDisplay(text) ?? text)
}

class CustomTable {
  constructor(data, rows, cols) {
    this.data = data
    this.rows = rows
    this.cols = cols
    this.revealIndex = data.length // how many cells are visible
    this.direction = 'across'
    this.cells = []
  }

  // Builds the table once. Showing / hiding numbers afterwards only toggles a class,
  // so the layout never shifts and anything layered on top of the table stays put.
  render(containerId, direction = 'across', font = 'Arial', fontSize = 50) {
    this.containerId = containerId
    this.direction = direction
    this.font = font
    this.fontSize = Number(fontSize) || 50
    this.revealIndex = this.data.length
    this._build()
  }

  progressiveRender(action) {
    if (!this.table) {
      console.error('Table must be rendered first.')
      return
    }

    switch (action) {
      case 'start':
      case 'restart':
        this.revealIndex = Math.min(1, this.data.length)
        break
      case 'next':
        this.revealIndex = Math.min(this.data.length, this.revealIndex + 1)
        break
      case 'back':
        this.revealIndex = Math.max(1, this.revealIndex - 1)
        break
      case 'reveal':
        this.revealIndex = this.data.length
        break
    }

    this._applyReveal()
  }

  setRevealIndex(n) {
    this.revealIndex = Math.max(0, Math.min(this.data.length, n))
    this._applyReveal()
  }

  // Shrinks the font (never grows it) so every column fits the container width.
  // Cheap to call repeatedly: it does nothing unless the container width changed.
  refit(force = false) {
    const { container, table } = this
    if (!container || !table) return

    const available = container.clientWidth
    if (!available) return
    if (!force && available === this._fitWidth) return
    this._fitWidth = available

    table.style.fontSize = `${this.fontSize}px`

    let widest = 0
    table.querySelectorAll('.cc-num').forEach((el) => {
      widest = Math.max(widest, el.offsetWidth)
    })

    const sample = table.querySelector('td')
    if (!sample) return
    const styles = getComputedStyle(sample)
    const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
    const needed = (widest + padding) * this.cols

    if (needed > available) {
      const scaled = this.fontSize * (available / needed) * 0.98
      table.style.fontSize = `${Math.max(8, Math.floor(scaled * 10) / 10)}px`
    }
  }

  _build() {
    const container = document.getElementById(this.containerId)
    if (!container) {
      console.error(`Container with ID "${this.containerId}" not found.`)
      return
    }

    const table = document.createElement('table')
    table.className = 'choral-table'
    table.style.fontFamily = this.font ? `"${this.font}", system-ui, sans-serif` : ''
    table.style.fontSize = `${this.fontSize}px`

    const tbody = document.createElement('tbody')
    this.cells = new Array(this.data.length)

    for (let r = 0; r < this.rows; r++) {
      const tr = document.createElement('tr')

      for (let c = 0; c < this.cols; c++) {
        const index = this.direction === 'down'
          ? c * this.rows + r
          : r * this.cols + c

        const td = document.createElement('td')
        td.className = 'cc-cell'
        td.innerHTML = `<span class="cc-num">${cellHTML(this.data[index])}</span>`
        this.cells[index] = td
        tr.appendChild(td)
      }

      tbody.appendChild(tr)
    }

    table.appendChild(tbody)
    container.innerHTML = ''
    container.appendChild(table)

    this.container = container
    this.table = table
    this._fitWidth = 0

    this._applyReveal()
    this.refit(true)
  }

  _applyReveal() {
    this.cells.forEach((td, i) => {
      if (!td) return
      const hidden = i >= this.revealIndex
      td.classList.toggle('is-hidden', hidden)
      td.setAttribute('aria-hidden', String(hidden))
    })
  }
}

class Fraction {
  // simplify = false keeps the fraction exactly as entered (e.g. 2/4 stays 2/4)
  constructor(numerator, denominator, simplify = true) {
    if (denominator === 0) {
      throw new Error('Denominator cannot be zero.')
    }
    this.numerator = numerator
    this.denominator = denominator
    if (simplify) {
      this.simplify()
    } else {
      this.normalizeFraction()
    }
  }

  static fromString(value, simplify = true) {
    if (value instanceof Fraction) return value
    if (typeof value !== 'string') {
      return new Fraction(Number(value), 1, simplify)
    }

    const trimmed = String(value).trim()
    if (!trimmed) return new Fraction(0, 1, simplify)

    const isNegative = trimmed.startsWith('-')
    const normalized = trimmed.replace(/^-/, '')

    if (normalized.includes(' ')) {
      const [wholePart, fracPart] = normalized.split(/\s+/)
      const [numStr, denStr] = (fracPart || '').split('/')
      const whole = Number(wholePart || 0)
      const numerator = Number(numStr || 0)
      const denominator = Number(denStr || 1)
      const totalNumerator = whole * denominator + numerator
      return new Fraction(isNegative ? -totalNumerator : totalNumerator, denominator, simplify)
    }

    if (normalized.includes('/')) {
      const [numStr, denStr] = normalized.split('/')
      const numerator = Number(numStr || 0)
      const denominator = Number(denStr || 1)
      return new Fraction(isNegative ? -numerator : numerator, denominator, simplify)
    }

    return new Fraction(isNegative ? -Number(normalized) : Number(normalized), 1, simplify)
  }

  getNumerator() {
    return this.numerator
  }

  getDenominator() {
    return this.denominator
  }

  toString(format = 'improper') {
    if (this.denominator === 1) {
      return this.numerator.toString()
    }

    if (format === 'mixed') {
      const isNegative = this.numerator < 0
      const absNumerator = Math.abs(this.numerator)
      const absDenominator = Math.abs(this.denominator)
      const whole = Math.floor(absNumerator / absDenominator)
      const remainder = absNumerator % absDenominator

      if (remainder === 0) {
        return `${isNegative ? '-' : ''}${whole}`
      } else if (whole === 0) {
        return `${isNegative ? '-' : ''}${remainder}/${absDenominator}`
      }
      return `${isNegative ? '-' : ''}${whole} ${remainder}/${absDenominator}`
    }

    // Default: improper fraction
    return `${this.numerator}/${this.denominator}`
  }

  normalizeFraction() {
    if (this.denominator < 0) {
      this.numerator = -this.numerator
      this.denominator = -this.denominator
    }
  }

  simplify() {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
    const divisor = gcd(this.numerator, this.denominator)
    this.numerator /= divisor
    this.denominator /= divisor
    this.normalizeFraction()
  }
}

class Polynomial {
  // input: string like "3x^2-2x+1" or array of coefficients (descending: [a_n,...,a0])
  // or a number n to create zero polynomial of degree n. optional degree param forces size (degree n).
  // Supports arbitrary single-letter variables (e.g. "n^2+2", "3t+2"). If no variable is present, defaults to 'x'.
  // Optional third parameter 'variable' preserves a particular variable when constructing from arrays/numbers.
  constructor(input = '0', degree, variable) {
    if (Array.isArray(input)) {
      this.coefficients = input.slice()
      this.variable = variable ?? null
    } else if (typeof input === 'string') {
      const parsed = Polynomial._parseString(input)
      this.coefficients = parsed.coeffs
      this.variable = variable ?? parsed.variable ?? null
    } else if (typeof input === 'number') {
      const n = Math.max(0, Math.floor(input))
      this.coefficients = new Array(n + 1).fill(0)
      this.variable = variable ?? null
    } else {
      this.coefficients = [0]
      this.variable = variable ?? null
    }

    if (typeof degree === 'number') {
      const targetLen = Math.max(1, Math.floor(degree) + 1)
      if (this.coefficients.length < targetLen) {
        const pad = new Array(targetLen - this.coefficients.length).fill(0)
        this.coefficients = pad.concat(this.coefficients)
      } else if (this.coefficients.length > targetLen) {
        // trim highest-degree terms to fit "up to degree n"
        this.coefficients = this.coefficients.slice(this.coefficients.length - targetLen)
      }
    }

    this._trim()
  }

  static _parseString(str) {
    str = String(str).replace(/\s+/g, '').toLowerCase()
    if (str === '') return { coeffs: [0], variable: 'x' }
    if (!/^[+-]/.test(str)) str = '+' + str

    // detect a variable letter (first alphabetic character) if any
    const varMatch = str.match(/[a-z]/)
    const variable = varMatch ? varMatch[0] : null

    const termPattern = /[+-][^+-]+/g
    const terms = str.match(termPattern) || []
    const coeffsMap = new Map()
    let maxPower = 0

    for (const term of terms) {
      const sign = term[0] === '-' ? -1 : 1
      const body = term.slice(1)

      if (variable && body.includes(variable)) {
        // coefficient part before the variable letter
        const beforeVar = body.split(variable)[0]
        // handle implied coeffs: '' => 1
        const coeffNum = (beforeVar === '' || beforeVar === '+') ? 1 : (beforeVar === '-' ? -1 : parseFloat(beforeVar))
        // power detection like 'x^3' or default 1
        const powerMatch = body.match(new RegExp(`${variable}\\^(\\d+)$`))
        const power = powerMatch ? parseInt(powerMatch[1], 10) : 1
        maxPower = Math.max(maxPower, power)
        coeffsMap.set(power, (coeffsMap.get(power) || 0) + sign * coeffNum)
      } else {
        // constant term (no variable)
        const val = parseFloat(body)
        coeffsMap.set(0, (coeffsMap.get(0) || 0) + sign * val)
        maxPower = Math.max(maxPower, 0)
      }
    }

    const arr = []
    for (let p = maxPower; p >= 0; p--) arr.push(coeffsMap.get(p) || 0)
    return { coeffs: arr.length ? arr : [0], variable: variable || null }
  }

  _trim() {
    // remove leading zeros, but leave single zero if polynomial is zero
    while (this.coefficients.length > 1 && Math.abs(this.coefficients[0]) === 0) {
      this.coefficients.shift()
    }
  }

  degree() {
    return this.coefficients.length - 1
  }

  toString() {
    const varName = this.variable || 'x'
    const deg = this.degree()
    if (deg === 0) return String(this.coefficients[0] || 0)

    const parts = []
    for (let i = 0; i < this.coefficients.length; i++) {
      const coeff = this.coefficients[i]
      const power = deg - i
      if (coeff === 0) continue

      const sign = coeff < 0 ? '-' : '+'
      const absVal = Math.abs(coeff)

      let coeffStr = ''
      if (power === 0) {
        coeffStr = String(absVal)
      } else if (absVal === 1) {
        coeffStr = '' // omit '1' for x terms
      } else {
        coeffStr = String(absVal)
      }

      let term
      if (power === 0) term = coeffStr
      else if (power === 1) term = `${coeffStr}${varName}`
      else term = `${coeffStr}${varName}^${power}`

      parts.push((parts.length === 0 && sign === '+') ? term : `${sign}${term}`)
    }

    return parts.length ? parts.join('') : '0'
  }

  // ensure polynomial instance (numbers become constant polynomials, strings parsed, arrays passed through)
  static _asPoly(p) {
    if (p instanceof Polynomial) return p
    if (typeof p === 'number') return new Polynomial([p])
    return new Polynomial(p)
  }

  // align coefficients arrays (descending) and return [aCoeffs, bCoeffs]
  static _align(a, b) {
    const la = a.length, lb = b.length
    if (la === lb) return [a.slice(), b.slice()]
    if (la > lb) {
      const pad = new Array(la - lb).fill(0)
      return [a.slice(), pad.concat(b)]
    }
    const pad = new Array(lb - la).fill(0)
    return [pad.concat(a), b.slice()]
  }

  add(other) {
    other = Polynomial._asPoly(other)
    const [A, B] = Polynomial._align(this.coefficients, other.coefficients)
    const res = A.map((v, i) => v + B[i])
    // preserve variable by passing it into the constructor
    return new Polynomial(res, undefined, this.variable || other.variable || 'x')
  }

  subtract(other) {
    other = Polynomial._asPoly(other)
    const [A, B] = Polynomial._align(this.coefficients, other.coefficients)
    const res = A.map((v, i) => v - B[i])
    return new Polynomial(res, undefined, this.variable || other.variable || 'x')
  }

  // optional: evaluate at x (numerical)
  evaluate(x) {
    let val = 0
    for (let i = 0; i < this.coefficients.length; i++) {
      val = val * x + this.coefficients[i]
    }
    return val
  }
}
