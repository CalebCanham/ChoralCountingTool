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

    const decimalModeLabel = document.getElementById("decimalModeLabel")
    const toggleDecimalMode = document.getElementById("toggleDecimalMode")
    const toggleDecimalWrapper = document.getElementById("toggleDecimalWrapper")

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

    fontInput.value = "Arial";
    fontSize.value = "50";

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
        fractionModeLabel.textContent = checked ? 'Fraction Type (Mixed)' : 'Fraction Type (Improper)'
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
                            toggleDecimalMode && toggleDecimalMode.checked ? true : false)

        let table = new CustomTable(data, numRows, numCols)
        document.getElementById('choralTableSetup').innerHTML = ''
        table.render("choralTableSetup", toggleSwitchDirection.checked ? "down" : "across", fontInput.value, fontSize.value, toggleFractionMode.checked ? "mixed" : "improper")
        table.progressiveRender("reveal")
    })

    // ==================================================================================================
    // Event listener for updating preview everytime something is edited and all necessary fields are filled
    typeOfNumberSelect.addEventListener('change', (event) => {
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
        fractionModeLabel.textContent = 'Fraction Type (Improper)'
        toggleDecimalMode.checked = false

        // Hide fraction-specific controls
        fractionModeLabel.classList.add('hidden')
        toggleFractionWrapper.classList.add('hidden')
        decimalModeLabel.classList.add('hidden')
        toggleDecimalWrapper.classList.add('hidden')

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
                                toggleFractionMode.checked ? "mixed" : "improper",
                                toggleDecimalMode && toggleDecimalMode.checked ? true : false)
            
        tablePresent = new CustomTable(data, numRows, numCols)
        choralTablePresent.innerHTML = ''
        tablePresent.render("choralTablePresent", toggleSwitchDirection.checked ? "down" : "across", fontInput.value, fontSize.value, toggleFractionMode.checked ? "mixed" : "improper")
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
    const container = document.getElementById('choralTablePresent')
    if (!container) return

    // ensure container uses relative positioning to host absolute canvas
    container.style.position = container.style.position || 'relative'

    // create or reuse container canvas
    let containerCanvas = container.querySelector('canvas.annotation-overlay')
    if (!containerCanvas) {
        containerCanvas = document.createElement('canvas')
        containerCanvas.className = 'annotation-overlay'
        containerCanvas.style.position = 'absolute'
        containerCanvas.style.left = '0'
        containerCanvas.style.top = '0'
        containerCanvas.style.width = '100%'
        containerCanvas.style.height = '100%'
        containerCanvas.style.zIndex = '1000'
        containerCanvas.style.pointerEvents = 'auto'
        container.appendChild(containerCanvas)
    }

    // create or reuse a full-page background canvas so users can draw on the page background
    let bgCanvas = document.querySelector('canvas.annotation-bg')
    if (!bgCanvas) {
        bgCanvas = document.createElement('canvas')
        bgCanvas.className = 'annotation-bg'
        bgCanvas.style.position = 'fixed'
        bgCanvas.style.left = '0'
        bgCanvas.style.top = '0'
        bgCanvas.style.width = '100vw'
        bgCanvas.style.height = '100vh'
        bgCanvas.style.zIndex = '800'
        bgCanvas.style.pointerEvents = 'none'
        document.body.appendChild(bgCanvas)
    }

    const containerCtx = containerCanvas.getContext('2d')
    const bgCtx = bgCanvas.getContext('2d')

    // shared drawing state
    let isDrawing = false
    let lastX = 0
    let lastY = 0
    let activeCanvas = null
    let activeCtx = null
    let tool = 'pen' // 'pen' or 'eraser'
    let penColor = document.getElementById('penColor')?.value || 'red'
    const penSize = 4
    const eraserSize = 48

    // visual cursor that follows the pointer (pen dot or eraser circle)
    let cursor = document.querySelector('.annotation-cursor')
    if (!cursor) {
        cursor = document.createElement('div')
        cursor.className = 'annotation-cursor'
        cursor.style.position = 'fixed'
        cursor.style.pointerEvents = 'none'
        cursor.style.transform = 'translate(-50%, -50%)'
        cursor.style.zIndex = '1100'
        cursor.style.display = 'none'
        document.body.appendChild(cursor)
    }

    // keep a list of listeners so we can remove them on teardown
    const _listeners = []

    function addListener(target, type, handler, options) {
        target.addEventListener(type, handler, options)
        _listeners.push({ target, type, handler, options })
    }

    function getCurrentPenColor() {
        const colorSelect = document.getElementById('penColor')
        return colorSelect?.value || penColor || 'red'
    }

    function setPenColor(color) {
        penColor = color || 'red'
        const colorSelect = document.getElementById('penColor')
        if (colorSelect && colorSelect.value !== penColor) {
            colorSelect.value = penColor
        }
        const ctx = activeCtx || containerCtx
        if (tool === 'pen' && ctx) {
            ctx.strokeStyle = penColor
        }
        cursor.style.background = penColor
    }

    function setTool(t) {
        tool = t
        const ctx = activeCtx || containerCtx
        const penBtnEl = document.getElementById('penBtn')
        const eraserBtnEl = document.getElementById('eraserBtn')
        if (t === 'pen') {
            if (penBtnEl) penBtnEl.classList.add('active')
            if (eraserBtnEl) eraserBtnEl.classList.remove('active')
            if (ctx) ctx.globalCompositeOperation = 'source-over'
            const color = getCurrentPenColor()
            setPenColor(color)
            if (ctx) ctx.lineWidth = penSize
            if (ctx) { ctx.lineCap = 'round'; ctx.lineJoin = 'round' }
            cursor.style.width = `${Math.max(6, penSize)}px`
            cursor.style.height = `${Math.max(6, penSize)}px`
            cursor.style.border = '1px solid rgba(0,0,0,0.1)'
            cursor.style.borderRadius = '50%'
            cursor.style.boxShadow = '0 0 4px rgba(0,0,0,0.15)'
            cursor.style.display = 'block'
        } else {
            if (eraserBtnEl) eraserBtnEl.classList.add('active')
            if (penBtnEl) penBtnEl.classList.remove('active')
            if (ctx) ctx.globalCompositeOperation = 'destination-out'
            if (ctx) ctx.strokeStyle = 'rgba(0,0,0,1)'
            if (ctx) ctx.lineWidth = eraserSize
            if (ctx) { ctx.lineCap = 'round'; ctx.lineJoin = 'round' }
            const dia = eraserSize
            cursor.style.width = `${dia}px`
            cursor.style.height = `${dia}px`
            cursor.style.background = 'rgba(255,255,255,0.0)'
            cursor.style.border = '2px solid rgba(0,0,0,0.4)'
            cursor.style.borderRadius = '50%'
            cursor.style.display = 'block'
        }
    }

    function getPosFromEvent(e, c) {
        const rect = c.getBoundingClientRect()
        const t = (e.touches && e.touches[0]) || e
        return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }

    function startDrawOn(canvas, ctx, x, y) {
        activeCanvas = canvas
        activeCtx = ctx
        isDrawing = true
        lastX = x
        lastY = y
        ctx.beginPath()
        ctx.moveTo(lastX, lastY)
        setTool(tool)
    }

    function drawToOn(ctx, x, y) {
        if (!isDrawing) return
        ctx.lineTo(x, y)
        ctx.stroke()
        lastX = x
        lastY = y
    }

    function stopDraw() {
        if (!isDrawing) return
        isDrawing = false
        if (activeCtx) activeCtx.closePath()
        activeCanvas = null
        activeCtx = null
    }

    function shouldStartBackgroundDraw(target) {
        if (!target) return true
        if (target.closest && target.closest('#choralTablePresent')) return false
        if (target.closest && target.closest('button, input, select, textarea, a, label')) return false
        return true
    }

    // Document-level handlers
    function onDocPointerDown(e) {
        const target = e.target
        if (!shouldStartBackgroundDraw(target)) return
        const p = getPosFromEvent(e, bgCanvas)
        startDrawOn(bgCanvas, bgCtx, p.x, p.y)
        e.preventDefault()
    }
    function onDocPointerMove(e) {
        const p = getPosFromEvent(e, bgCanvas)
        cursor.style.left = `${e.clientX}px`
        cursor.style.top = `${e.clientY}px`
        if (isDrawing && activeCtx === bgCtx) drawToOn(bgCtx, p.x, p.y)
    }
    function onDocPointerUp() {
        if (isDrawing && activeCtx === bgCtx) stopDraw()
    }

    function containerMouseDown(e) {
        const p = getPosFromEvent(e, containerCanvas)
        startDrawOn(containerCanvas, containerCtx, p.x, p.y)
        e.preventDefault()
    }
    function containerMouseMove(e) {
        const p = getPosFromEvent(e, containerCanvas)
        cursor.style.left = `${e.clientX}px`
        cursor.style.top = `${e.clientY}px`
        if (isDrawing && activeCtx === containerCtx) drawToOn(containerCtx, p.x, p.y)
    }
    function containerMouseUp() { if (isDrawing && activeCtx === containerCtx) stopDraw() }

    addListener(containerCanvas, 'mousedown', containerMouseDown)
    addListener(containerCanvas, 'mousemove', containerMouseMove)
    addListener(containerCanvas, 'mouseup', containerMouseUp)
    addListener(containerCanvas, 'mouseleave', (e) => {
        if (isDrawing && activeCtx === containerCtx) {
            const p = getPosFromEvent(e, bgCanvas)
            if (activeCtx) activeCtx.closePath()
            startDrawOn(bgCanvas, bgCtx, p.x, p.y)
        }
        if (!isDrawing) cursor.style.display = 'none'
    })
    addListener(containerCanvas, 'mouseenter', (e) => {
        cursor.style.display = 'block'
        cursor.style.left = `${e.clientX}px`
        cursor.style.top = `${e.clientY}px`
        if (isDrawing && activeCtx === bgCtx) {
            const p = getPosFromEvent(e, containerCanvas)
            if (activeCtx) activeCtx.closePath()
            startDrawOn(containerCanvas, containerCtx, p.x, p.y)
        }
    })

    addListener(containerCanvas, 'touchstart', (e) => { const p = getPosFromEvent(e, containerCanvas); startDrawOn(containerCanvas, containerCtx, p.x, p.y); e.preventDefault() }, { passive: false })
    addListener(containerCanvas, 'touchmove', (e) => { const p = getPosFromEvent(e, containerCanvas); cursor.style.left = `${e.touches[0].clientX}px`; cursor.style.top = `${e.touches[0].clientY}px`; if (isDrawing && activeCtx === containerCtx) drawToOn(containerCtx, p.x, p.y); e.preventDefault() }, { passive: false })
    addListener(containerCanvas, 'touchend', (e) => { if (activeCtx === containerCtx) stopDraw(); e.preventDefault() }, { passive: false })

    addListener(document, 'mousedown', onDocPointerDown)
    addListener(document, 'mousemove', onDocPointerMove)
    addListener(document, 'mouseup', onDocPointerUp)

    const colorSelect = document.getElementById('penColor')
    if (colorSelect) {
        addListener(colorSelect, 'change', (e) => {
            setPenColor(e.target.value)
        })
    }
    addListener(document, 'touchstart', (e) => {
        const target = e.target
        if (!shouldStartBackgroundDraw(target)) return
        const p = getPosFromEvent(e, bgCanvas)
        startDrawOn(bgCanvas, bgCtx, p.x, p.y)
        e.preventDefault()
    }, { passive: false })
    addListener(document, 'touchmove', (e) => {
        const target = e.target
        if (!shouldStartBackgroundDraw(target)) return
        const p = getPosFromEvent(e, bgCanvas)
        cursor.style.left = `${e.touches[0].clientX}px`
        cursor.style.top = `${e.touches[0].clientY}px`
        if (isDrawing && activeCtx === bgCtx) drawToOn(bgCtx, p.x, p.y)
        e.preventDefault()
    }, { passive: false })
    addListener(document, 'touchend', (e) => { if (isDrawing && activeCtx === bgCtx) stopDraw(); e.preventDefault() }, { passive: false })

    // wire tool buttons and clear (only once). handlers call the live __annotationState
    const penBtnEl = document.getElementById('penBtn')
    const eraserBtnEl = document.getElementById('eraserBtn')
    const clearBtnEl = document.getElementById('clearBtn')
    if (!__annotationToolsWired) {
        if (penBtnEl) penBtnEl.addEventListener('click', () => {
            if (window.__annotationState && typeof window.__annotationState.setTool === 'function') window.__annotationState.setTool('pen')
        })
        if (eraserBtnEl) eraserBtnEl.addEventListener('click', () => {
            if (window.__annotationState && typeof window.__annotationState.setTool === 'function') window.__annotationState.setTool('eraser')
        })
        if (clearBtnEl) clearBtnEl.addEventListener('click', () => {
            if (window.__annotationState && typeof window.__annotationState.clear === 'function') window.__annotationState.clear()
        })
        __annotationToolsWired = true
    }

    // resize canvases to match container/body
    function resizeAll() {
        const crect = container.getBoundingClientRect()
        containerCanvas.width = Math.round(crect.width)
        containerCanvas.height = Math.round(crect.height)
        containerCtx.lineCap = 'round'
        containerCtx.lineJoin = 'round'

        bgCanvas.width = Math.round(window.innerWidth)
        bgCanvas.height = Math.round(window.innerHeight)
        bgCtx.lineCap = 'round'
        bgCtx.lineJoin = 'round'

        setTool(tool)
    }
    resizeAll()
    addListener(window, 'resize', resizeAll)

    // expose a live state object so external handlers call into the current canvases/ctx
    window.__annotationState = {
        containerCanvas,
        containerCtx,
        bgCanvas,
        bgCtx,
        setTool: (t) => { setTool(t) },
        setColor: (color) => { setPenColor(color) },
        clear: () => {
            containerCtx.clearRect(0, 0, containerCanvas.width, containerCanvas.height)
            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height)
        },
        resize: () => resizeAll(),
        cursor,
        _listeners
    }

    // provide a teardown helper so the rest of the app can remove canvases and listeners
    window.teardownAnnotationCanvas = function teardownAnnotationCanvas() {
        try {
            if (window.__annotationState && Array.isArray(window.__annotationState._listeners)) {
                for (const entry of window.__annotationState._listeners.slice()) {
                    const { target, type, handler, options } = entry
                    try {
                        target.removeEventListener(type, handler, options)
                    } catch (err) {
                        try { target.removeEventListener(type, handler) } catch (e) {}
                    }
                }
            }
        } catch (err) {
            // ignore cleanup errors
        }
        const cc = document.querySelector('canvas.annotation-overlay')
        if (cc && cc.parentNode) cc.parentNode.removeChild(cc)
        const bc = document.querySelector('canvas.annotation-bg')
        if (bc && bc.parentNode) bc.parentNode.removeChild(bc)
        const cEl = document.querySelector('.annotation-cursor')
        if (cEl) cEl.style.display = 'none'
        if (window.__annotationState) {
            delete window.__annotationState.containerCanvas
            delete window.__annotationState.containerCtx
            delete window.__annotationState.bgCanvas
            delete window.__annotationState.bgCtx
            delete window.__annotationState.setTool
            delete window.__annotationState.setColor
            delete window.__annotationState.clear
            delete window.__annotationState.resize
            delete window.__annotationState.cursor
            delete window.__annotationState._listeners
        }
    }

    setTool(tool)
}