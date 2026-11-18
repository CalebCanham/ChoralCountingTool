export { DrawingLayer }

// A drawing surface that covers one element (the "stage": the table plus the space around it).
//
//  - Everything is scoped to the stage. Nothing is attached to the document or window except
//    a ResizeObserver, so it can never draw on (or react to) anything outside the stage.
//  - With the "none" tool the canvas ignores the pointer entirely, so text can be selected and
//    touch scrolling works normally.
//  - The cursor dot only exists while a pen / eraser is active AND the pointer is over the stage.
//  - The canvas is a sibling of the table, so showing / hiding numbers never touches the ink.
class DrawingLayer {
    constructor({ stage, canvas, cursor }) {
        this.stage = stage
        this.canvas = canvas
        this.cursor = cursor
        this.ctx = canvas.getContext('2d')

        this.tool = 'none' // 'none' | 'pen' | 'eraser'
        this.color = '#e11d48'
        this.sizes = { pen: 5, eraser: 44 }

        this.drawing = false
        this.pointerId = null
        this.last = null
        this.hasInk = false

        this._cssWidth = 0
        this._cssHeight = 0
        this._dpr = 1

        this._bind()
        this.resize()
        this._styleCursor()
    }

    get active() {
        return this.tool !== 'none'
    }

    setTool(tool) {
        this.tool = tool
        this.stage.dataset.tool = tool
        this._endStroke()
        this._hideCursor()
        this._styleCursor()
    }

    setColor(color) {
        this.color = color
        this._styleCursor()
    }

    clear() {
        const { ctx, canvas } = this
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
        this.hasInk = false
    }

    // Keeps the canvas matched to the stage. Existing ink is stretched to the new size so it
    // stays roughly on top of the numbers it was drawn around.
    resize() {
        const width = this.stage.clientWidth
        const height = this.stage.clientHeight
        if (!width || !height) return

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        if (width === this._cssWidth && height === this._cssHeight && dpr === this._dpr) return

        const { canvas, ctx } = this
        let snapshot = null
        if (this.hasInk && canvas.width && canvas.height) {
            snapshot = document.createElement('canvas')
            snapshot.width = canvas.width
            snapshot.height = canvas.height
            snapshot.getContext('2d').drawImage(canvas, 0, 0)
        }

        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        if (snapshot) {
            ctx.save()
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, canvas.width, canvas.height)
            ctx.restore()
        }

        this._cssWidth = width
        this._cssHeight = height
        this._dpr = dpr
    }

    // ---------------------------------------------------------------- internals

    _bind() {
        const { canvas } = this
        canvas.addEventListener('pointerdown', (e) => this._onDown(e))
        canvas.addEventListener('pointermove', (e) => this._onMove(e))
        canvas.addEventListener('pointerup', (e) => this._onUp(e))
        canvas.addEventListener('pointercancel', (e) => this._onUp(e))
        canvas.addEventListener('pointerenter', (e) => this._onEnter(e))
        canvas.addEventListener('pointerleave', (e) => this._onLeave(e))

        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(() => this.resize()).observe(this.stage)
        } else {
            window.addEventListener('resize', () => this.resize())
        }
    }

    _position(e) {
        const rect = this.canvas.getBoundingClientRect()
        return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    _onDown(e) {
        if (!this.active) return
        if (e.pointerType === 'mouse' && e.button !== 0) return
        e.preventDefault()
        this._beginStroke(e)
        this._moveCursor(e)
    }

    _onMove(e) {
        if (!this.active) return
        this._moveCursor(e)

        if (!this.drawing || e.pointerId !== this.pointerId) return
        const events = (e.getCoalescedEvents && e.getCoalescedEvents()) || []
        for (const ev of events.length ? events : [e]) {
            const point = this._position(ev)
            this._segment(this.last, point)
            this.last = point
        }
    }

    _onUp(e) {
        if (e.pointerId === this.pointerId) this._endStroke()
    }

    _onEnter(e) {
        if (!this.active) return
        this._moveCursor(e)
        // dragging back onto the stage with the button held continues drawing
        if (e.pointerType === 'mouse' && (e.buttons & 1)) this._beginStroke(e)
    }

    _onLeave() {
        this._endStroke()
        this._hideCursor()
    }

    _beginStroke(e) {
        this.drawing = true
        this.pointerId = e.pointerId
        this.last = this._position(e)
        this._dot(this.last)
    }

    _endStroke() {
        this.drawing = false
        this.pointerId = null
        this.last = null
    }

    _applyBrush() {
        const { ctx } = this
        const erasing = this.tool === 'eraser'
        ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over'
        ctx.strokeStyle = erasing ? '#000' : this.color
        ctx.fillStyle = erasing ? '#000' : this.color
        ctx.lineWidth = this.sizes[erasing ? 'eraser' : 'pen']
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
    }

    _dot(point) {
        const { ctx } = this
        this._applyBrush()
        ctx.beginPath()
        ctx.arc(point.x, point.y, ctx.lineWidth / 2, 0, Math.PI * 2)
        ctx.fill()
        this.hasInk = true
    }

    _segment(from, to) {
        const { ctx } = this
        this._applyBrush()
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
        this.hasInk = true
    }

    _moveCursor(e) {
        // touch has no hover, so there is nothing for a dot to follow
        if (e.pointerType === 'touch') {
            this._hideCursor()
            return
        }

        const rect = this.stage.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        this.cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
        this.cursor.style.display = 'block'
    }

    _hideCursor() {
        this.cursor.style.display = 'none'
    }

    _styleCursor() {
        const { cursor } = this
        const erasing = this.tool === 'eraser'
        const size = this.sizes[erasing ? 'eraser' : 'pen']
        cursor.style.width = `${size}px`
        cursor.style.height = `${size}px`
        cursor.classList.toggle('is-eraser', erasing)
        cursor.style.background = erasing ? '' : this.color
    }
}
