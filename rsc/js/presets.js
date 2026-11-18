export { presets }

// =====================================================================================
// FREQUENTLY USED COUNTS
//
// This is the only file you need to edit to add more preloaded counts.
// Each preset is one line:
//
//   make(group, type, start, interval, mode, rows, columns, extras)
//
//   group    - the heading it appears under in the dropdown (use the names in GROUPS below,
//              or type a new name to create a new heading)
//   type     - 'Integer' | 'Decimal' | 'Fraction' | 'Polynomial'
//   start    - starting number, as text      e.g. '5', '0.25', '1/4', '2n+2'
//   interval - amount to count by, as text   e.g. '5', '0.25', '1/4', '2n+2'
//   mode     - '+' to count forwards, '-' to count backwards
//   rows     - number of rows
//   columns  - number of columns
//   extras   - optional settings (all optional):
//                title:        text shown above the table (default is generated for you)
//                label:        text shown in the dropdown (default is the title)
//                direction:    'across' | 'down'
//                decimals:     true to keep the same number of decimal places in every cell
//                fractionType: 'improper' (default) | 'mixed'
//                fractionForm: 'simplified' (default) | 'unsimplified'
// =====================================================================================

const GROUPS = {
    forward: 'Whole numbers: counting forwards',
    place: 'Whole numbers: place value',
    backward: 'Whole numbers: counting backwards',
    decimal: 'Decimals',
    fraction: 'Fractions',
    algebra: 'Variables and expressions'
}

const make = (group, type, start, interval, mode, rows, columns, extras = {}) => {
    const direction = mode === '-' ? 'backwards' : 'forwards'
    // "starting at x" reads better than "starting from x" for variables
    const preposition = type === 'Polynomial' ? 'at' : 'from'

    return {
        group,
        type,
        start,
        interval,
        mode,
        rows: String(rows),
        cols: String(columns),
        title: `Count ${direction} by ${interval}, starting ${preposition} ${start}`,
        ...extras
    }
}

const UNSIMPLIFIED = { fractionForm: 'unsimplified' }
const MIXED = { fractionType: 'mixed' }
const MIXED_UNSIMPLIFIED = { fractionType: 'mixed', fractionForm: 'unsimplified' }
const SAME_DECIMALS = { decimals: true }

const labelled = (extras, text) => ({ ...extras, label: text })

const presets = [
    // ---------------------------------------------------------------- Whole numbers: forwards
    make(GROUPS.forward, 'Integer', '1', '1', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '2', '2', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '3', '3', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '4', '4', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '5', '5', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '6', '6', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '7', '7', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '8', '8', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '9', '9', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '10', '10', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '11', '11', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '12', '12', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '25', '25', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '1', '2', '+', 4, 5),
    make(GROUPS.forward, 'Integer', '3', '5', '+', 4, 5),

    // ---------------------------------------------------------------- Whole numbers: place value
    make(GROUPS.place, 'Integer', '3', '10', '+', 4, 5),
    make(GROUPS.place, 'Integer', '7', '10', '+', 4, 5),
    make(GROUPS.place, 'Integer', '985', '10', '+', 4, 5),
    make(GROUPS.place, 'Integer', '995', '1', '+', 4, 5),
    make(GROUPS.place, 'Integer', '100', '100', '+', 4, 5),
    make(GROUPS.place, 'Integer', '37', '100', '+', 4, 5),
    make(GROUPS.place, 'Integer', '950', '100', '+', 4, 5),
    make(GROUPS.place, 'Integer', '1000', '1000', '+', 4, 5),

    // ---------------------------------------------------------------- Whole numbers: backwards
    make(GROUPS.backward, 'Integer', '20', '1', '-', 4, 5),
    make(GROUPS.backward, 'Integer', '40', '2', '-', 4, 5),
    make(GROUPS.backward, 'Integer', '30', '3', '-', 4, 5),
    make(GROUPS.backward, 'Integer', '100', '5', '-', 4, 5),
    make(GROUPS.backward, 'Integer', '200', '10', '-', 4, 5),
    make(GROUPS.backward, 'Integer', '500', '25', '-', 4, 5),
    make(GROUPS.backward, 'Integer', '2000', '100', '-', 4, 5),
    make(GROUPS.backward, 'Integer', '10000', '1000', '-', 2, 5),

    // ---------------------------------------------------------------- Decimals
    make(GROUPS.decimal, 'Decimal', '0.1', '0.1', '+', 4, 5, SAME_DECIMALS),
    make(GROUPS.decimal, 'Decimal', '0.2', '0.2', '+', 4, 5, SAME_DECIMALS),
    make(GROUPS.decimal, 'Decimal', '0.25', '0.25', '+', 4, 5, SAME_DECIMALS),
    make(GROUPS.decimal, 'Decimal', '0.5', '0.5', '+', 4, 5, SAME_DECIMALS),
    make(GROUPS.decimal, 'Decimal', '0.05', '0.05', '+', 5, 4, SAME_DECIMALS),
    make(GROUPS.decimal, 'Decimal', '0.01', '0.01', '+', 4, 5, SAME_DECIMALS),
    make(GROUPS.decimal, 'Decimal', '0', '0.1', '+', 4, 5, SAME_DECIMALS),
    make(GROUPS.decimal, 'Decimal', '3', '0.1', '-', 4, 5, SAME_DECIMALS),
    make(GROUPS.decimal, 'Decimal', '5', '0.25', '-', 4, 5, SAME_DECIMALS),
    make(GROUPS.decimal, 'Decimal', '10', '0.5', '-', 4, 5, SAME_DECIMALS),
    make(GROUPS.decimal, 'Decimal', '1', '0.01', '-', 4, 5, SAME_DECIMALS),

    // ---------------------------------------------------------------- Fractions
    // Quarters
    make(GROUPS.fraction, 'Fraction', '0', '1/4', '+', 5, 4),
    make(GROUPS.fraction, 'Fraction', '1/4', '1/4', '+', 5, 4,
        labelled(UNSIMPLIFIED, 'Count forwards by 1/4, starting from 1/4 (unsimplified: 1/4, 2/4, 3/4, 4/4)')),
    make(GROUPS.fraction, 'Fraction', '1/4', '1/4', '+', 5, 4,
        labelled({}, 'Count forwards by 1/4, starting from 1/4 (simplified: 1/4, 1/2, 3/4, 1)')),
    make(GROUPS.fraction, 'Fraction', '1/4', '1/4', '+', 5, 4,
        labelled(MIXED_UNSIMPLIFIED, 'Count forwards by 1/4, starting from 1/4 (mixed, unsimplified)')),
    make(GROUPS.fraction, 'Fraction', '1/4', '1/4', '+', 5, 4,
        labelled(MIXED, 'Count forwards by 1/4, starting from 1/4 (mixed, simplified)')),
    make(GROUPS.fraction, 'Fraction', '3/4', '3/4', '+', 4, 5),
    // Halves
    make(GROUPS.fraction, 'Fraction', '1/2', '1/2', '+', 5, 4,
        labelled(UNSIMPLIFIED, 'Count forwards by 1/2, starting from 1/2 (unsimplified)')),
    make(GROUPS.fraction, 'Fraction', '1/2', '1/2', '+', 5, 4,
        labelled({}, 'Count forwards by 1/2, starting from 1/2 (simplified)')),
    make(GROUPS.fraction, 'Fraction', '1/2', '1/2', '+', 5, 4,
        labelled(MIXED, 'Count forwards by 1/2, starting from 1/2 (mixed)')),
    // Thirds
    make(GROUPS.fraction, 'Fraction', '1/3', '1/3', '+', 5, 4,
        labelled(UNSIMPLIFIED, 'Count forwards by 1/3, starting from 1/3 (unsimplified)')),
    make(GROUPS.fraction, 'Fraction', '1/3', '1/3', '+', 5, 4,
        labelled(MIXED, 'Count forwards by 1/3, starting from 1/3 (mixed)')),
    make(GROUPS.fraction, 'Fraction', '2/3', '2/3', '+', 4, 5),
    // Fifths, sixths, eighths, tenths
    make(GROUPS.fraction, 'Fraction', '1/5', '1/5', '+', 5, 4,
        labelled(UNSIMPLIFIED, 'Count forwards by 1/5, starting from 1/5 (unsimplified)')),
    make(GROUPS.fraction, 'Fraction', '1/5', '1/5', '+', 5, 4,
        labelled(MIXED, 'Count forwards by 1/5, starting from 1/5 (mixed)')),
    make(GROUPS.fraction, 'Fraction', '1/6', '1/6', '+', 5, 4,
        labelled(UNSIMPLIFIED, 'Count forwards by 1/6, starting from 1/6 (unsimplified)')),
    make(GROUPS.fraction, 'Fraction', '1/8', '1/8', '+', 5, 4,
        labelled(UNSIMPLIFIED, 'Count forwards by 1/8, starting from 1/8 (unsimplified)')),
    make(GROUPS.fraction, 'Fraction', '1/10', '1/10', '+', 5, 4,
        labelled(UNSIMPLIFIED, 'Count forwards by 1/10, starting from 1/10 (unsimplified)')),
    // Backwards
    make(GROUPS.fraction, 'Fraction', '5', '1/4', '-', 5, 4, MIXED),
    make(GROUPS.fraction, 'Fraction', '10', '1/2', '-', 5, 4, MIXED),
    make(GROUPS.fraction, 'Fraction', '7', '1/3', '-', 5, 4, MIXED),

    // ---------------------------------------------------------------- Variables and expressions
    make(GROUPS.algebra, 'Polynomial', 'x', '2', '+', 3, 5),
    make(GROUPS.algebra, 'Polynomial', '2', '2n+2', '+', 3, 5),
    make(GROUPS.algebra, 'Polynomial', 'n', 'n', '+', 3, 5),
    make(GROUPS.algebra, 'Polynomial', 'n', '3', '+', 3, 5),
    make(GROUPS.algebra, 'Polynomial', 'x+1', '2', '+', 3, 5),
    make(GROUPS.algebra, 'Polynomial', '2n', '2n', '+', 3, 5),
    make(GROUPS.algebra, 'Polynomial', 'n', 'n+1', '+', 3, 5),
    make(GROUPS.algebra, 'Polynomial', '1', 'n', '+', 3, 5),
    make(GROUPS.algebra, 'Polynomial', '3', '2n', '+', 3, 5),
    make(GROUPS.algebra, 'Polynomial', 'n^2', 'n^2', '+', 3, 5),
    make(GROUPS.algebra, 'Polynomial', 'x', '2', '-', 3, 5),
    make(GROUPS.algebra, 'Polynomial', '10n', 'n', '-', 3, 5)
]
