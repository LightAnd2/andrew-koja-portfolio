// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
            e.preventDefault()
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    })
})

// Active nav on scroll
const sections = document.querySelectorAll('section[id]')
const navLinks = document.querySelectorAll('.nav-link')
const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('active'))
            const a = document.querySelector(`.nav-link[href="#${entry.target.id}"]`)
            if (a) a.classList.add('active')
        }
    })
}, { threshold: 0.4 })
sections.forEach(s => navObserver.observe(s))

// Contact form
function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    const name    = form.querySelector('input[type="text"]').value
    const email   = form.querySelector('input[type="email"]').value
    const subject = form.querySelectorAll('input[type="text"]')[1].value
    const message = form.querySelector('textarea').value
    const body = `From: ${name} (${email})%0A%0A${encodeURIComponent(message)}`
    window.location.href = `mailto:kojaandrew0@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`
}

// 3D perspective star field — stars fly toward viewer and off screen
;(function () {
    const canvas = document.getElementById('hero-canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const COUNT  = 500
    const SPEED  = 0.004
    const FOV    = 0.45   // field of view scale

    // Perspective center — mouse steers it
    let cx = 0, cy = 0, tx = 0, ty = 0

    const COLORS = [
        [255, 255, 255],
        [200, 220, 255],
        [255, 245, 210],
        [180, 205, 255],
    ]

    class Star {
        constructor(spread) {
            this.reset(spread)
        }

        reset(spread) {
            // Random position in 3D space
            this.x  = (Math.random() - 0.5) * 2
            this.y  = (Math.random() - 0.5) * 2
            this.z  = spread ? Math.random() : 1   // start spread out or at far distance
            this.pz = this.z
            const c = COLORS[Math.floor(Math.random() * COLORS.length)]
            this.r = c[0]; this.g = c[1]; this.b = c[2]
        }

        update() {
            this.pz = this.z
            this.z -= SPEED
            if (this.z <= 0.001) this.reset(false)
        }

        draw(W, H) {
            const scale = FOV * W

            // Project current and previous position
            const sx  = (this.x  / this.z)  * scale + cx
            const sy  = (this.y  / this.z)  * scale + cy
            const px  = (this.x  / this.pz) * scale + cx
            const py  = (this.y  / this.pz) * scale + cy

            // Cull if off screen
            if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) {
                this.reset(false)
                return
            }

            const progress = 1 - this.z          // 0 = far, 1 = close
            const alpha    = Math.min(1, progress * 1.4)
            const size     = progress * 2.8

            // Trail line
            const len = Math.hypot(sx - px, sy - py)
            if (len > 0.5) {
                const g = ctx.createLinearGradient(px, py, sx, sy)
                g.addColorStop(0, `rgba(${this.r},${this.g},${this.b},0)`)
                g.addColorStop(1, `rgba(${this.r},${this.g},${this.b},${alpha * 0.85})`)
                ctx.beginPath()
                ctx.moveTo(px, py)
                ctx.lineTo(sx, sy)
                ctx.strokeStyle = g
                ctx.lineWidth   = size * 0.6
                ctx.stroke()
            }

            // Star dot
            ctx.beginPath()
            ctx.arc(sx, sy, Math.max(0.3, size * 0.45), 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${alpha})`
            ctx.fill()
        }
    }

    let stars = []

    function resize() {
        canvas.width  = window.innerWidth
        canvas.height = window.innerHeight
        cx = canvas.width  / 2
        cy = canvas.height / 2
        tx = cx; ty = cy
        stars = Array.from({ length: COUNT }, () => new Star(true))
    }

    function animate() {
        // Motion blur — semi-transparent clear
        ctx.fillStyle = 'rgba(5,10,15,0.25)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Smoothly pull center toward mouse
        cx += (tx - cx) * 0.05
        cy += (ty - cy) * 0.05

        stars.forEach(s => { s.update(); s.draw(canvas.width, canvas.height) })
        requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)

    const hero = document.getElementById('home')
    hero.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect()
        tx = e.clientX - rect.left
        ty = e.clientY - rect.top
    })
    hero.addEventListener('mouseleave', () => {
        tx = canvas.width  / 2
        ty = canvas.height / 2
    })

    resize()
    animate()
})()
