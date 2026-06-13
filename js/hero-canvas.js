(function () {

    const canvas = document.getElementById('hero-canvas');
    const ctx =  canvas.getContext('2d');

    let W, H, t = 0;
    let mouse = { x:-999, y:-999 };

    let particles = [];

    function makeParticle(aged) {
        const accent = Math.random() < 0.22;
        return {
            x: Math.random() * (W || 600),
            y: Math.random() * (H || 400),
            age: aged ? Math.floor(Math.random() *120) : 0,
            maxAge: 80 + Math.floor(Math.random() * 80),
            accent: accent,
            speed: accent ? (0.3 + Math.random() *0.4) : (0.2 +Math.random() * 0.3)
        };
    }

    function spawn() {
        particles = Array.from({ length: 110 }, () => makeParticle(true));
    }

    function getAngle(x, y) {
        const s = 0.003;
        let angle = Math.sin(x * s + t * 0.008) * Math.cos(y * s * 1.3 + t *0.006)
                  + Math.sin(x * s *2.1 - t * 0.005) * 0.5
                  + Math.cos(y * s *1.7 + x * s * 0.9 + t * 0.004) * 0.3;
         angle *= Math.PI * 2;

    const dx = mouse.x - x;
    const dy = mouse.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 220 && mouse.x > 0) {
      const proximity = 1 - dist / 220;
      const influence = proximity * proximity * 0.95;
      angle = angle * (1 - influence) + Math.atan2(dy, dx) * influence;
    }
    return angle;
  }

  canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', function () {
    mouse.x = -999;
    mouse.y = -999;
  });
    

    //redimensiona o canvas quando a janela muda de tamanho
      function resize() {
    const hero = canvas.parentElement;
    W = canvas.width = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
    spawn();
  }

    resize();
    window.addEventListener('resize', resize);
    draw();

    //loop principal
      function draw() {
    t++;
    ctx.fillStyle = 'rgba(17,17,17,0.18)';
    ctx.fillRect(0, 0, W, H);

    particles.forEach(function (p) {
      p.age++;
      if (p.age > p.maxAge) {
        Object.assign(p, makeParticle(false));
        return;
      }

      const angle = getAngle(p.x, p.y);
      const life = Math.min(p.age / 20, 1) * Math.min((p.maxAge - p.age) / 20, 1);
      const nx = p.x + Math.cos(angle) * p.speed;
      const ny = p.y + Math.sin(angle) * p.speed;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = p.accent
        ? 'rgba(232,255,90,' + (life * 1.0) + ')'
        : 'rgba(255,255,255,' + (life * 0.35) + ')';
      ctx.lineWidth = p.accent ? 0.8 : 0.5;
      ctx.stroke();

      p.x = nx;
      p.y = ny;

      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    requestAnimationFrame(draw);
  }

})();