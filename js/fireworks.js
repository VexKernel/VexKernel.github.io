(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'click-fireworks';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'fixed',
        inset: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '32767',
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = ['#ff324a', '#31ffa6', '#206eff', '#ffff99'];
    const bursts = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    function resize() {
        const ratio = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function easeOut(progress) {
        return progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    }

    function draw(now) {
        ctx.clearRect(0, 0, width, height);

        for (let i = bursts.length - 1; i >= 0; i--) {
            const burst = bursts[i];
            const age = Math.max(0, now - burst.started);
            if (age >= burst.duration) {
                bursts.splice(i, 1);
                continue;
            }

            const ringProgress = Math.min(age / burst.duration, 1);
            ctx.globalAlpha = Math.max(0, 1 - age / 550);
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, 170 * easeOut(ringProgress), 0, Math.PI * 2);
            ctx.lineWidth = 6 * (1 - ringProgress);
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            for (const particle of burst.particles) {
                const progress = Math.min(age / particle.duration, 1);
                if (progress >= 1) continue;
                const distance = easeOut(progress);
                ctx.globalAlpha = 1 - progress;
                ctx.beginPath();
                ctx.arc(
                    burst.x + particle.dx * distance,
                    burst.y + particle.dy * distance,
                    particle.radius * (1 - progress),
                    0,
                    Math.PI * 2,
                );
                ctx.fillStyle = particle.color;
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
        frame = bursts.length ? requestAnimationFrame(draw) : 0;
    }

    function launch(x, y) {
        const particles = Array.from({ length: 24 }, () => ({
            dx: (Math.random() - 0.5) * 400,
            dy: (Math.random() - 0.5) * 400,
            radius: 12 + Math.random() * 16,
            duration: 1200 + Math.random() * 600,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));
        bursts.push({ x, y, started: performance.now(), duration: 1800, particles });
        if (!frame) frame = requestAnimationFrame(draw);
    }

    document.addEventListener('mousedown', (event) => {
        if (event.button === 0) launch(event.clientX, event.clientY);
    });
    window.addEventListener('resize', resize, { passive: true });
    resize();
})();
