import { CustomTable } from './classes.js'
import { generateData, validateSettings } from './functions.js'
import { presets } from './presets.js'
import { DrawingLayer } from './drawing.js'

const DEFAULTS = {
    type: 'Integer',
    rows: '5',
    cols: '5',
    font: 'Arial',
    fontSize: '50'
}

const FONTS = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS',
    'Courier New', 'Lucida Console', 'Segoe UI', 'Roboto', 'Open Sans', 'Lato', 'Calibri',
    'Gill Sans', 'Comic Sans MS'
]

const NUMBER_TYPES = ['Integer', 'Decimal', 'Fraction', 'Polynomial']

const init = () => {
    const $ = (id) => document.getElementById(id)

    // ---- layout
    const layout = $('layout')
    const hideSetupBtn = $('hideSetupBtn')
    const showSetupBtn = $('showSetupBtn')

    // ---- settings form
    const form = $('count-settings')
    const presetSelect = $('frequently-used')
    const titleInput = $('title')
    const typeSelect = $('type-of-number')
    const startInput = $('starting-number')
    const intervalInput = $('interval')
    const rowsInput = $('rows')
    const columnsInput = $('columns')
    const fontSelect = $('font')
    const fontSizeInput = $('font-size')
    const fractionOptions = $('fractionOptions')
    const decimalOptions = $('decimalOptions')
    const resetBtn = $('resetBtn')

    // ---- presentation
    const stage = $('stage')
    const stageTitle = $('stageTitle')
    const tableHost = $('choralTable')
    const emptyState = $('emptyState')
    const emptyTitle = $('emptyTitle')
    const emptyMessage = $('emptyMessage')
    const progress = $('progress')
    const restartBtn = $('restartBtn')
    const removeBtn = $('removeBtn')
    const nextBtn = $('nextBtn')
    const showAllBtn = $('showAllBtn')
    const clearBtn = $('clearBtn')
    const toolButtons = [...document.querySelectorAll('.seg-btn[data-tool]')]
    const swatches = [...document.querySelectorAll('.swatch[data-color]')]

    let table = null
    let lastDataKey = null
    let rebuildTimer = null

    const drawing = new DrawingLayer({ stage, canvas: $('drawCanvas'), cursor: $('drawCursor') })

    // ==============================================================================================
    // Populate dropdowns
    // ==============================================================================================
    const optionGroups = new Map()
    presets.forEach((preset, index) => {
        if (!optionGroups.has(preset.group)) {
            const group = document.createElement('optgroup')
            group.label = preset.group
            optionGroups.set(preset.group, group)
            presetSelect.appendChild(group)
        }
        const option = document.createElement('option')
        option.value = String(index)
        option.textContent = preset.label || preset.title
        optionGroups.get(preset.group).appendChild(option)
    })

    NUMBER_TYPES.forEach((type) => {
        const option = document.createElement('option')
        option.value = type
        option.textContent = type
        typeSelect.appendChild(option)
    })

    FONTS.forEach((font) => {
        const option = document.createElement('option')
        option.value = font
        option.textContent = font
        option.style.fontFamily = `"${font}", sans-serif`
        fontSelect.appendChild(option)
    })

    // ==============================================================================================
    // Small helpers
    // ==============================================================================================
    const getRadio = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value
    const setRadio = (name, value) => {
        const input = form.querySelector(`input[name="${name}"][value="${value}"]`)
        if (input) input.checked = true
    }

    const clampFontSize = (value) => {
        const n = parseFloat(value)
        if (!Number.isFinite(n)) return Number(DEFAULTS.fontSize)
        return Math.min(200, Math.max(10, n))
    }

    const readSettings = () => ({
        title: titleInput.value.trim(),
        type: typeSelect.value,
        start: startInput.value.trim(),
        interval: intervalInput.value.trim(),
        rows: rowsInput.value.trim(),
        cols: columnsInput.value.trim(),
        direction: getRadio('direction') || 'across',
        mode: getRadio('mode') || 'increment',
        fractionType: getRadio('fractionType') || 'improper',
        fractionForm: getRadio('fractionForm') || 'simplified',
        decimals: getRadio('decimals') || 'minimal',
        font: fontSelect.value || DEFAULTS.font,
        fontSize: clampFontSize(fontSizeInput.value)
    })

    // ==============================================================================================
    // Settings -> UI
    // ==============================================================================================
    const updateNumberTypeControls = () => {
        fractionOptions.classList.toggle('hidden', typeSelect.value !== 'Fraction')
        decimalOptions.classList.toggle('hidden', typeSelect.value !== 'Decimal')
    }

    const updateTitle = () => {
        const title = titleInput.value.trim()
        stageTitle.textContent = title
        stageTitle.classList.toggle('hidden', !title)
        document.title = title ? `${title} | Choral Counting` : 'Choral Counting'
    }

    const updateControls = () => {
        const hasTable = Boolean(table)
        const index = hasTable ? table.revealIndex : 0
        const length = hasTable ? table.data.length : 0

        restartBtn.disabled = !hasTable
        showAllBtn.disabled = !hasTable || index >= length
        removeBtn.disabled = !hasTable || index <= 1
        nextBtn.disabled = !hasTable || index >= length
        progress.textContent = hasTable ? `${index} of ${length} shown` : ''
    }

    const showEmpty = ({ status, message }) => {
        table = null
        lastDataKey = null
        tableHost.innerHTML = ''
        emptyState.classList.remove('hidden')
        emptyState.dataset.kind = status
        emptyTitle.textContent = status === 'invalid' ? 'Check your settings' : 'Build your count'
        emptyMessage.textContent = message
        drawing.clear()
        updateControls()
    }

    // ==============================================================================================
    // Build / rebuild the table from the current settings
    // ==============================================================================================
    const rebuild = () => {
        clearTimeout(rebuildTimer)

        const settings = readSettings()
        const check = validateSettings(settings)
        if (check.status !== 'ok') {
            showEmpty(check)
            return
        }

        let data
        try {
            data = generateData(settings)
        } catch (err) {
            console.error(err)
            showEmpty({ status: 'invalid', message: 'Those values could not be turned into a count. Check the starting number and interval.' })
            return
        }

        // If only the look changed (font, size, direction) keep the current reveal position.
        // If the numbers changed, show everything so the new layout can be compared at a glance.
        const dataKey = JSON.stringify([
            settings.type, settings.start, settings.interval, settings.mode, settings.rows, settings.cols,
            settings.fractionType, settings.fractionForm, settings.decimals
        ])
        const keepReveal = table && dataKey === lastDataKey ? table.revealIndex : Infinity

        emptyState.classList.add('hidden')
        table = new CustomTable(data, Number(settings.rows), Number(settings.cols))
        table.render('choralTable', settings.direction, settings.font, settings.fontSize)
        table.setRevealIndex(keepReveal)
        lastDataKey = dataKey

        // ink drawn on the old layout no longer lines up with anything
        drawing.clear()
        updateControls()
    }

    const scheduleRebuild = () => {
        clearTimeout(rebuildTimer)
        rebuildTimer = setTimeout(rebuild, 80)
    }

    // ==============================================================================================
    // Settings events
    // ==============================================================================================
    const onFormEvent = (event) => {
        if (event.target === presetSelect) return // handled below

        if (event.target === titleInput) {
            updateTitle() // title never changes the table, so no rebuild (and the ink stays put)
            return
        }

        if (event.target === typeSelect) updateNumberTypeControls()
        scheduleRebuild()
    }
    form.addEventListener('input', onFormEvent)
    form.addEventListener('change', onFormEvent)
    form.addEventListener('submit', (e) => e.preventDefault())

    presetSelect.addEventListener('change', () => {
        const preset = presets[parseInt(presetSelect.value, 10)]
        if (!preset) return

        titleInput.value = preset.title
        typeSelect.value = preset.type
        startInput.value = preset.start
        intervalInput.value = preset.interval
        rowsInput.value = preset.rows
        columnsInput.value = preset.cols
        setRadio('mode', preset.mode === '-' ? 'decrement' : 'increment')
        setRadio('fractionType', preset.fractionType || 'improper')
        setRadio('fractionForm', preset.fractionForm || 'simplified')
        setRadio('decimals', preset.decimals ? 'consistent' : 'minimal')
        if (preset.direction) setRadio('direction', preset.direction)

        updateNumberTypeControls()
        updateTitle()
        rebuild()
    })

    const resetSettings = () => {
        presetSelect.selectedIndex = 0
        titleInput.value = ''
        typeSelect.value = DEFAULTS.type
        startInput.value = ''
        intervalInput.value = ''
        rowsInput.value = DEFAULTS.rows
        columnsInput.value = DEFAULTS.cols
        fontSelect.value = DEFAULTS.font
        fontSizeInput.value = DEFAULTS.fontSize
        setRadio('direction', 'across')
        setRadio('mode', 'increment')
        setRadio('fractionType', 'improper')
        setRadio('fractionForm', 'simplified')
        setRadio('decimals', 'minimal')

        updateNumberTypeControls()
        updateTitle()
        rebuild()
    }
    resetBtn.addEventListener('click', resetSettings)

    // ==============================================================================================
    // Presentation controls
    // ==============================================================================================
    const step = (action) => {
        if (!table) return
        table.progressiveRender(action)
        updateControls()
    }

    restartBtn.addEventListener('click', () => step('restart'))
    removeBtn.addEventListener('click', () => step('back'))
    nextBtn.addEventListener('click', () => step('next'))
    showAllBtn.addEventListener('click', () => step('reveal'))

    // Arrow keys step through the count, but never while someone is typing in / adjusting a setting
    document.addEventListener('keydown', (e) => {
        if (!table || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
        if (e.target instanceof Element && e.target.closest('input, select, textarea, [contenteditable="true"]')) return

        const actions = { ArrowRight: 'next', ArrowLeft: 'back', ArrowUp: 'reveal', Home: 'restart' }
        const action = actions[e.key]
        if (!action) return

        e.preventDefault()
        step(action)
    })

    // Clicking the table area hands the keyboard back to the arrow-key shortcuts
    stage.addEventListener('pointerdown', () => {
        const active = document.activeElement
        if (active && active.matches && active.matches('input, select, textarea')) active.blur()
    })

    // ==============================================================================================
    // Drawing controls
    // ==============================================================================================
    const selectTool = (tool) => {
        drawing.setTool(tool)
        toolButtons.forEach((button) => {
            const on = button.dataset.tool === tool
            button.classList.toggle('is-active', on)
            button.setAttribute('aria-pressed', String(on))
        })
    }

    const selectColor = (color) => {
        drawing.setColor(color)
        swatches.forEach((swatch) => {
            const on = swatch.dataset.color === color
            swatch.classList.toggle('is-active', on)
            swatch.setAttribute('aria-pressed', String(on))
        })
    }

    toolButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const tool = button.dataset.tool
            // tapping the active pen / eraser again switches drawing off
            selectTool(tool === drawing.tool && tool !== 'none' ? 'none' : tool)
        })
    })

    swatches.forEach((swatch) => {
        swatch.addEventListener('click', () => {
            selectColor(swatch.dataset.color)
            if (drawing.tool !== 'pen') selectTool('pen')
        })
    })

    clearBtn.addEventListener('click', () => drawing.clear())

    // ==============================================================================================
    // Hide / show settings so the table can fill the screen
    // ==============================================================================================
    const setSetupVisible = (visible) => {
        layout.classList.toggle('is-focus', !visible)
        hideSetupBtn.setAttribute('aria-expanded', String(visible))
        showSetupBtn.classList.toggle('hidden', visible)
    }

    hideSetupBtn.addEventListener('click', () => setSetupVisible(false))
    showSetupBtn.addEventListener('click', () => setSetupVisible(true))

    // ==============================================================================================
    // Keep the table fitted to its space (window resize, rotating a tablet, hiding settings ...)
    // ==============================================================================================
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(() => table && table.refit()).observe(tableHost)
    } else {
        window.addEventListener('resize', () => table && table.refit())
    }
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => table && table.refit(true))
    }

    // ==============================================================================================
    // Start
    // ==============================================================================================
    selectTool('none')
    selectColor(swatches[0]?.dataset.color || '#e11d48')
    resetSettings()
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
