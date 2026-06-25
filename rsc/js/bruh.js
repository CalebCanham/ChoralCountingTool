import { CustomTable, Fraction } from './classes.js'
import { generateData } from './functions.js'

// track whether global annotation tool buttons have been wired to avoid duplicate listeners
let __annotationToolsWired = false

// Ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Setup Screen
    const setupDiv = document.getElementById("setup")
    const titleInput = document.getElementById('title')

    // Input elements
    const frequentlyUsedSelect = document.getElementById('frequently-used')
    const typeOfNumberSelect = document.getElementById('type-of-number')
    const startingNumberInput = document.getElementById('starting-number')
    const intervalInput = document.getElementById('interval')
    const rowsInput = document.getElementById('rows')
    const columnsInput = document.getElementById('columns')

    // Toggle Elements
    const directionLabel = document.getElementById("directionLabel")
    const toggleSwitchDirection = document.getElementById('toggleSwitchDirection')

    const modeLabel = document.getElementById("modeLabel")
    const toggleSwitchMode = document.getElementById('toggleSwitchMode')

    const fractionModeLabel = document.getElementById("fractionModeLabel")
    const toggleFractionMode = document.getElementById("toggleFractionMode")
    const toggleFractionWrapper = document.getElementById("toggleFractionWrapper")

    // Font Customization
    const fontInput = document.getElementById("font")
    const fontSize = document.getElementById("font-size")

    const resetBtn = document.getElementById("resetBtn")

    // Table Element
    const presentBtn = document.getElementById("presentBtn")
    const choralTable = document.getElementById("choralTable")

    // Presemt Screem
    let presentBool = false
    const presentDiv = document.getElementById("present")
    const presentHeader = document.getElementById("presentHeader")
    const choralTablePresent = document.getElementById("choralTablePresent")
    let tablePresent

    // Buttons
    const restartBtn = document.getElementById("restartBtn")
    const removeBtn = document.getElementById("removeBtn")
    const nextBtn = document.getElementById("nextBtn")
    const showAllBtn = document.getElementById("showAllBtn")
    const returnBtn = document.getElementById("returnBtn")
    
    const clearBtn = document.getElementById("clearBtn")
    const penBtn = document.getElementById("penBtn")
    const eraserBtn = document.getElementById("eraserBtn")

    // ==================================================================================================
    // Populating Frequently Used Presets Selection
    // Format = ["title", "start", "interval", "direction", "numtype"]
    const freqPresets = [
        ["Count forwards by 5, starting from 5", "5", "5", "+", 0, "4", "5"],
        ["Count backwards by 3, starting from 30", "30", "3", "-", 0, "4", "5"],
        ["Count forwards by 0.05, starting from 0.05", "0.05", "0.05", "+", 1, "5", "4"],
        ["Count forwards by 1/4, starting from 0", "0", "1/4", "+", 2, "5", "4"],
        ["Count forwards by 2, starting at x", "x", "2", "+", 3, "3", "5"],
        ["Count forwards by 2n+2, starting at 2", "2", "2n+2", "+", 3, "3", "5"]
    ]

    freqPresets.forEach(preset => {
        const option = document.createElement('option')
        option.value = freqPresets.indexOf(preset)
        option.textContent = preset[0]
        frequentlyUsedSelect.appendChild(option)
    })

    // ==================================================================================================
    // Populating Number Types Selection
    const numTypePresets = ["Integer", "Decimal", "Fraction", "Polynomial"]

    numTypePresets.forEach(preset => {
        const option = document.createElement('option')
        option.value = preset
        option.textContent = preset
        typeOfNumberSelect.appendChild(option)
    })

    // ==================================================================================================
    // Populating Font Types Selection
    const fonts = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Tahoma", "Trebuchet MS", "Courier New", "Lucida Console", "Segoe UI", "Roboto", "Open Sans", "Lato", "Calibri", "Gill Sans"]

    fonts.forEach(font => {
        const option = document.createElement('option')
        option.value = font
        option.textContent = font
        fontInput.appendChild(option)
    })

    // ==================================================================================================
    // Event listener that autopopulates relevant fields when a frequent preset is selected
    frequentlyUsedSelect.addEventListener('change', (e) => {
        const idx = parseInt(e.target.value, 10)
        const [title, start, interval, mode, numType, rows, cols] = freqPresets[idx]

        // populate inputs from the selected preset
        titleInput.value = title
        startingNumberInput.value = start
        intervalInput.value = interval
        rowsInput.value = rows
        columnsInput.value = cols
        typeOfNumberSelect.selectedIndex = numType + 1
        toggleSwitchMode.checked = !(mode === '+')
    })

    // ==================================================================================================
    // Event listener for visually updating text for direction toggle
    toggleSwitchDirection.addEventListener('change', (e) => {
        const checked = e.target.checked
        directionLabel.textContent = checked ? 'Direction (Down)' : 'Direction (Across)'
    })

    // ==================================================================================================
    // Event listener for visually updating text for mode toggle
    toggleSwitchMode.addEventListener('change', (e) => {
        const checked = e.target.checked
        modeLabel.textContent = checked ? 'Mode (Decrement)' : 'Mode (Increment)'
    })

        // ==================================================================================================
    // Event listener for visually updating text for mode toggle
    toggleFractionMode.addEventListener('change', (e) => {
        const checked = e.target.checked
        fractionModeLabel.textContent = checked ? 'Fraction Type (Improper)' : 'Fraction Type (Mixed)'
    })

    // ==================================================================================================
    // Event listener for updating preview everytime something is edited and all necessary fields are filled
    document.addEventListener('change', (event) => {
        let numRows = Number(rowsInput.value)
        let numCols = Number(columnsInput.value)
        let data = generateData(startingNumberInput.value, 
                            intervalInput.value,
                            toggleSwitchMode.checked ? "-" : "+",
                            typeOfNumberSelect.value,
                            numRows * numCols,
                            toggleFractionMode.checked ? "mixed" : "improper",
                            toggleDecimalMode.checked ? true : false)

        let table = new CustomTable(data, numRows, numCols)
        document.getElementById('choralTableSetup').innerHTML = ''
        table.render("choralTableSetup", toggleSwitchDirection.checked ? "down" : "across", fontInput.value, fontSize.value)
        table.progressiveRender("reveal")
    })

    // ==================================================================================================
    // Event listener for updating preview everytime something is edited and all necessary fields are filled
    typeOfNumberSelect,addEventListener('change', (event) => {
        if (typeOfNumberSelect.value === "Fraction") {
            fractionModeLabel.classList.remove("hidden")
            toggleFractionWrapper.classList.remove("hidden")
        } else if (!(typeOfNumberSelect.value === "Fraction")) {
            fractionModeLabel.classList.add("hidden")
            toggleFractionWrapper.classList.add("hidden")
        }

        if (typeOfNumberSelect.value === "Decimal") {
            decimalModeLabel.classList.remove("hidden")
            toggleDecimalWrapper.classList.remove("hidden")
        } else if (!(typeOfNumberSelect.value === "Decimal")) {
            decimalModeLabel.classList.add("hidden")
            toggleDecimalWrapper.classList.add("hidden")
        }
    })

    // ==================================================================================================
    // Event listener for reset button, clears all fields and resets to default
    resetBtn.addEventListener('click', () => {
        // Clear all input fields
        titleInput.value = ''
        startingNumberInput.value = ''
        intervalInput.value = ''
        rowsInput.value = ''
        columnsInput.value = ''
        fontSize.value = ''

        // Reset selects/dropdowns
        frequentlyUsedSelect.selectedIndex = 0
        typeOfNumberSelect.selectedIndex = 0
        fontInput.selectedIndex = 0

        // Reset toggles and update their labels
        toggleSwitchDirection.checked = false
        directionLabel.textContent = 'Direction (Across)'
        toggleSwitchMode.checked = false
        modeLabel.textContent = 'Mode (Increment)'
        toggleFractionMode.checked = false
        fractionModeLabel.textContent = 'Fraction Type (Mixed)'

        // Hide fraction-specific controls
        fractionModeLabel.classList.add('hidden')
        toggleFractionWrapper.classList.add('hidden')

        // Clear previews / rendered tables
        document.getElementById('choralTableSetup').innerHTML = ''
        choralTable.innerHTML = ''
    })

    // ==================================================================================================
    // Event listener for present button
    presentBtn.addEventListener('click', () => {
        setupDiv.classList.add("hidden")
        
        let numRows = Number(rowsInput.value)
        let numCols = Number(columnsInput.value)
        let data = generateData(startingNumberInput.value, 
                                intervalInput.value,
                                toggleSwitchMode.checked ? "-" : "+",
                                typeOfNumberSelect.value,
                                numRows * numCols,
                                toggleFractionMode.checked ? "mixed" : "improper")
            
        tablePresent = new CustomTable(data, numRows, numCols)
        choralTablePresent.innerHTML = ''
        tablePresent.render("choralTablePresent", toggleSwitchDirection.checked ? "down" : "across", fontInput.value, fontSize.value)
        tablePresent.progressiveRender("start")
        presentHeader.textContent = titleInput.value
        presentDiv.classList.remove("hidden")
        presentBool = true
        // initialize annotation canvas overlay after rendering the table
        setupAnnotationCanvas()

        // wrap progressiveRender so the annotation canvas is restored after each re-render
        if (tablePresent && typeof tablePresent.progressiveRender === 'function') {
            const _origPR = tablePresent.progressiveRender.bind(tablePresent)
            tablePresent.progressiveRender = (action) => {
                // if there is an existing annotation canvas, serialize its contents
                const existingCanvas = document.getElementById('choralTablePresent')?.querySelector('canvas.annotation-overlay')
                let savedDataURL = null
                if (existingCanvas) {
                    try {
                        savedDataURL = existingCanvas.toDataURL()
                    } catch (e) {
                        savedDataURL = null
                    }
                }

                _origPR(action)

                // recreate or resize the annotation canvas after the table re-renders
                setupAnnotationCanvas()

                // restore drawing if possible
                if (savedDataURL) {
                    const newCanvas = document.getElementById('choralTablePresent')?.querySelector('canvas.annotation-overlay')
                    if (newCanvas) {
                        const img = new Image()
                        img.onload = () => {
                            const ctx = newCanvas.getContext('2d')
                            // draw scaled to new canvas size
                            ctx.clearRect(0, 0, newCanvas.width, newCanvas.height)
                            ctx.drawImage(img, 0, 0, newCanvas.width, newCanvas.height)
                        }
                        img.src = savedDataURL
                    }
                }
            }
        }
    })

    // ==================================================================================================
    // Event listener for return  button
    returnBtn.addEventListener('click', () => {
        setupDiv.classList.remove("hidden")
        presentDiv.classList.add("hidden")
        presentBool = false
        // teardown annotation canvases and listeners so the tools are inactive off the present screen
        if (typeof window.teardownAnnotationCanvas === 'function') {
            try { window.teardownAnnotationCanvas() } catch (e) {}
        } else {
            // fallback: hide cursor if present and clear global state
            if (window.__annotationState && window.__annotationState.cursor) window.__annotationState.cursor.style.display = 'none'
            if (window.__annotationState && typeof window.__annotationState.clear === 'function') window.__annotationState.clear()
            // remove state reference
            delete window.__annotationState
        }
    })

    // ==================================================================================================
    // Event listeners for presentation buttons
    restartBtn.addEventListener('click', () => tablePresent.progressiveRender("restart") )
    removeBtn.addEventListener('click', () => tablePresent.progressiveRender("back") )
    nextBtn.addEventListener('click', () => tablePresent.progressiveRender("next") )
    showAllBtn.addEventListener('click', () => tablePresent.progressiveRender("reveal") )

    document.addEventListener('keydown', (e) => {

        if(presentBool) {

            switch(e.key){
                case "ArrowUp": 
                    tablePresent.progressiveRender("reveal")
                    break
                case "ArrowLeft": 
                    tablePresent.progressiveRender("back")
                    break
                case "ArrowRight": 
                    tablePresent.progressiveRender("next")
                    break
                case "ArrowRight": 
                    tablePresent.progressiveRender("next")
                    break
            } // end switch
        } // end if(presentBool)
    }) // end keydown listener
})

// Annotation canvas and drawing tools
function setupAnnotationCanvas() {
    const presentDiv = document.getElementById('present')
    if (!presentDiv) return

    // Ensure presentDiv uses relative positioning so canvas scrolls with it
    presentDiv.style.position = 'relative'

    // Create or reuse single drawing canvas that covers entire content area
    let drawingCanvas = presentDiv.querySelector('canvas.drawing-canvas')
    if (!drawingCanvas) {
        drawingCanvas = document.createElement('canvas')
        drawingCanvas.className = 'drawing-canvas'
        drawingCanvas.style.position = 'absolute'
        drawingCanvas.style.left = '0'
        drawingCanvas.style.top = '0'
        drawingCanvas.style.zIndex = '900'
        drawingCanvas.style.pointerEvents = 'auto'
        presentDiv.appendChild(drawingCanvas)
    }

    const ctx = drawingCanvas.getContext('2d')

    // Drawing state
    let isDrawing = false
    let lastX = 0
    let lastY = 0
    let tool = 'pen'
    const penColor = 'red'
    const penSize = 4
    const eraserSize = 48

    // Visual cursor
    let cursor = document.querySelector('.drawing-cursor')
    if (!cursor) {
        cursor = document.createElement('div')
        cursor.className = 'drawing-cursor'
        cursor.style.position = 'fixed'
        cursor.style.pointerEvents = 'none'
        cursor.style.transform = 'translate(-50%, -50%)'
        cursor.style.zIndex = '1100'
        cursor.style.display = 'none'
        document.body.appendChild(cursor)
    }

    const _listeners = []

    function addListener(target, type, handler, options) {
        target.addEventListener(type, handler, options)
        _listeners.push({ target, type, handler, options })
    }

    function setTool(t) {
        tool = t
        if (t === 'pen') {
            cursor.style.width = `${Math.max(6, penSize)}px`
            cursor.style.height = `${Math.max(6, penSize)}px`
            cursor.style.background = penColor
            cursor.style.border = '1px solid rgba(0,0,0,0.1)'
            cursor.style.borderRadius = '50%'
            cursor.style.boxShadow = '0 0 4px rgba(0,0,0,0.15)'
            ctx.globalCompositeOperation = 'source-over'
            ctx.strokeStyle = penColor
            ctx.lineWidth = penSize
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
        } else {
            const dia = eraserSize
            cursor.style.width = `${dia}px`
            cursor.style.height = `${dia}px`
            cursor.style.background = 'rgba(255,255,255,0.0)'
            cursor.style.border = '2px solid rgba(0,0,0,0.4)'
            cursor.style.borderRadius = '50%'
            ctx.globalCompositeOperation = 'destination-out'
            ctx.strokeStyle = 'rgba(0,0,0,1)'
            ctx.lineWidth = eraserSize
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
        }
    }

    function getPosFromEvent(e) {
        const rect = drawingCanvas.getBoundingClientRect()
        const t = (e.touches && e.touches[0]) || e
        return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }

    function startDraw(x, y) {
        isDrawing = true
        lastX = x
        lastY = y
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    function drawTo(x, y) {
        if (!isDrawing) return
        ctx.lineTo(x, y)
        ctx.stroke()
        lastX = x
        lastY = y
    }

    function stopDraw() {
        if (!isDrawing) return
        isDrawing = false
        ctx.closePath()
    }

    function shouldDraw(target) {
        if (!target) return true
        if (target.closest && target.closest('button, input, select, textarea, a, label')) return false
        return true
    }

    // Mouse handlers
    function onMouseDown(e) {
        if (!shouldDraw(e.target)) return
        const p = getPosFromEvent(e)
        startDraw(p.x, p.y)
        e.preventDefault()
    }

    function onMouseMove(e) {
        const p = getPosFromEvent(e)
        cursor.style.left = `${e.clientX}px`
        cursor.style.top = `${e.clientY}px`
        if (isDrawing) drawTo(p.x, p.y)
    }

    function onMouseUp() {
        stopDraw()
    }

    function onMouseLeave() {
        cursor.style.display = 'none'
    }

    function onMouseEnter() {
        cursor.style.display = 'block'
    }

    // Touch handlers
    function onTouchStart(e) {
        if (!shouldDraw(e.target)) return
        const p = getPosFromEvent(e)
        startDraw(p.x, p.y)
        e.preventDefault()
    }

    function onTouchMove(e) {
        if (!shouldDraw(e.target)) return
        const p = getPosFromEvent(e)
        cursor.style.left = `${e.touches[0].clientX}px`
        cursor.style.top = `${e.touches[0].clientY}px`
        if (isDrawing) drawTo(p.x, p.y)
        e.preventDefault()
    }

    function onTouchEnd(e) {
        stopDraw()
        e.preventDefault()
    }

    // Attach listeners
    addListener(drawingCanvas, 'mousedown', onMouseDown)
    addListener(drawingCanvas, 'mousemove', onMouseMove)
    addListener(drawingCanvas, 'mouseup', onMouseUp)
    addListener(drawingCanvas, 'mouseleave', onMouseLeave)
    addListener(drawingCanvas, 'mouseenter', onMouseEnter)
    addListener(drawingCanvas, 'touchstart', onTouchStart, { passive: false })
    addListener(drawingCanvas, 'touchmove', onTouchMove, { passive: false })
    addListener(drawingCanvas, 'touchend', onTouchEnd, { passive: false })

    // Resize canvas to cover full content
    function resizeCanvas() {
        drawingCanvas.width = Math.round(presentDiv.offsetWidth)
        drawingCanvas.height = Math.round(presentDiv.offsetHeight)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        setTool(tool)
    }

    resizeCanvas()
    addListener(window, 'resize', resizeCanvas)

    // Expose state for buttons
    window.__drawingState = {
        setTool: (t) => { setTool(t) },
        clear: () => {
            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
        },
        canvas: drawingCanvas,
        ctx: ctx,
        _listeners
    }

    // Wire tool buttons
    const penBtnEl = document.getElementById('penBtn')
    const eraserBtnEl = document.getElementById('eraserBtn')
    const clearBtnEl = document.getElementById('clearBtn')

    if (!__annotationToolsWired) {
        if (penBtnEl) penBtnEl.addEventListener('click', () => {
            if (window.__drawingState) window.__drawingState.setTool('pen')
            if (penBtnEl) penBtnEl.classList.add('active')
            if (eraserBtnEl) eraserBtnEl.classList.remove('active')
        })
        if (eraserBtnEl) eraserBtnEl.addEventListener('click', () => {
            if (window.__drawingState) window.__drawingState.setTool('eraser')
            if (eraserBtnEl) eraserBtnEl.classList.add('active')
            if (penBtnEl) penBtnEl.classList.remove('active')
        })
        if (clearBtnEl) clearBtnEl.addEventListener('click', () => {
            if (window.__drawingState) window.__drawingState.clear()
        })
        __annotationToolsWired = true
    }

    // Teardown function
    window.teardownAnnotationCanvas = function teardownAnnotationCanvas() {
        try {
            if (window.__drawingState && Array.isArray(window.__drawingState._listeners)) {
                for (const entry of window.__drawingState._listeners.slice()) {
                    const { target, type, handler, options } = entry
                    try {
                        target.removeEventListener(type, handler, options)
                    } catch (err) {
                        try { target.removeEventListener(type, handler) } catch (e) {}
                    }
                }
            }
        } catch (err) {}
        
        const dc = document.querySelector('canvas.drawing-canvas')
        if (dc && dc.parentNode) dc.parentNode.removeChild(dc)
        
        const cEl = document.querySelector('.drawing-cursor')
        if (cEl && cEl.parentNode) cEl.parentNode.removeChild(cEl)
        
        if (window.__drawingState) delete window.__drawingState
    }

    setTool(tool)
}