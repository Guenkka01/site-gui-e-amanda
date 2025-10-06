// Utilidades: seleção

const $ = (sel) => document.querySelector(sel);

// DATA INICIAL: 01/03/2025 (formato BR → 1 de março de 2025)
const START_DATE = new Date(2025, 2, 1, 0, 0, 0); // meses 0-index → 2 = março
const KNOWN_DATE = new Date(2016, 1, 18, 0, 0, 0); // 18/02/2016

// Música de fundo
const audioEl = $('#bg-music');
const audioToggleBtn = $('#audio-toggle');

// Não tocar música automaticamente ao carregar
if (audioEl) {
    audioEl.pause();
    audioEl.currentTime = 0;
}

function setMusicEffect(active) {
    if (!musicEffect) return;
    if (active) {
        musicEffect.style.display = 'block';
        musicEffect.classList.add('active');
        musicEffect.style.position = 'fixed';
        musicEffect.style.top = 0;
        musicEffect.style.left = 0;
        musicEffect.style.width = '100vw';
        musicEffect.style.height = '100vh';
        musicEffect.style.zIndex = 9999;
        musicEffect.style.pointerEvents = 'none';
        musicEffect.style.background = 'radial-gradient(circle, rgba(120,230,196,0.25) 0%, rgba(24,165,126,0.18) 60%, rgba(10,42,34,0.01) 100%)';
        musicEffect.style.opacity = '1';
        document.querySelectorAll('.music-animated').forEach(el => {
            el.classList.add('music-dance');
        });
    } else {
        musicEffect.style.opacity = '0';
        musicEffect.classList.remove('active');
        musicEffect.style.display = 'none';
        document.querySelectorAll('.music-animated').forEach(el => {
            el.classList.remove('music-dance');
        });
    }
}

// Alterna música e efeito contínuo
audioToggleBtn.addEventListener('click', () => {
    if (audioEl.paused) {
        audioEl.play();
        audioToggleBtn.classList.remove('paused');
        setMusicEffect(true);
        document.querySelector('.icon-play').style.display = 'none';
        document.querySelector('.icon-pause').style.display = 'block';
    } else {
        audioEl.pause();
        audioToggleBtn.classList.add('paused');
        setMusicEffect(false);
        pararTrocaFoto();
        document.querySelector('.icon-play').style.display = 'block';
        document.querySelector('.icon-pause').style.display = 'none';
    }
});

// Contador preciso (anos, meses, dias, horas, minutos, segundos)
const ids = ['years','months','days','hours','minutes','seconds'];
const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const knownIds = ['known-years','known-months','known-days','known-hours','known-minutes','known-seconds'];
const knownEls = Object.fromEntries(knownIds.map(id => [id, document.getElementById(id)]));

function clampNonNegative(n) { return Math.max(0, n|0); }

function diffYMDHMS(from, to) {
	// Calcula anos, meses, dias, horas, minutos, segundos exatos por calendário
	let years = to.getFullYear() - from.getFullYear();
	let months = to.getMonth() - from.getMonth();
	let days = to.getDate() - from.getDate();
	let hours = to.getHours() - from.getHours();
	let minutes = to.getMinutes() - from.getMinutes();
	let seconds = to.getSeconds() - from.getSeconds();

	// Normalizações encadeadas (emprestando tempo conforme necessário)
	if (seconds < 0) { seconds += 60; minutes -= 1; }
	if (minutes < 0) { minutes += 60; hours -= 1; }
	if (hours < 0) { hours += 24; days -= 1; }

	if (days < 0) {
		const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0); // último dia do mês anterior
		days += prevMonth.getDate();
		months -= 1;
	}

	if (months < 0) { months += 12; years -= 1; }

	return {
		years: clampNonNegative(years),
		months: clampNonNegative(months),
		days: clampNonNegative(days),
		hours: clampNonNegative(hours),
		minutes: clampNonNegative(minutes),
		seconds: clampNonNegative(seconds)
	};
}

function updateCounter() {
    const now = new Date();
    // Tempo de namoro
    const d = diffYMDHMS(START_DATE, now);
    els.years.textContent = d.years;
    els.months.textContent = d.months;
    els.days.textContent = d.days;
    els.hours.textContent = d.hours.toString().padStart(2,'0');
    els.minutes.textContent = d.minutes.toString().padStart(2,'0');
    els.seconds.textContent = d.seconds.toString().padStart(2,'0');

    // Tempo que se conhecem
    const k = diffYMDHMS(KNOWN_DATE, now);
    knownEls['known-years'].textContent = k.years;
    knownEls['known-months'].textContent = k.months;
    knownEls['known-days'].textContent = k.days;
    knownEls['known-hours'].textContent = k.hours.toString().padStart(2,'0');
    knownEls['known-minutes'].textContent = k.minutes.toString().padStart(2,'0');
    knownEls['known-seconds'].textContent = k.seconds.toString().padStart(2,'0');
}

// Atualização em tempo real
updateCounter();
setInterval(updateCounter, 1000);

// Canvas de corações/flocos brilhantes
const canvas = document.getElementById('bg-hearts');
const ctx = canvas.getContext('2d');
let particles = [];
let vw = 0, vh = 0, dpr = Math.min(2, window.devicePixelRatio || 1);

function resizeCanvas() {
	vw = window.innerWidth;
	vh = window.innerHeight;
	canvas.width = Math.floor(vw * dpr);
	canvas.height = Math.floor(vh * dpr);
	canvas.style.width = vw + 'px';
	canvas.style.height = vh + 'px';
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function rand(min, max) { return Math.random() * (max - min) + min; }

function createHeartParticle() {
	const size = rand(8, 18);
	return {
		x: rand(0, vw),
		y: vh + rand(10, 60),
		size,
		speedY: rand(18, 38) / 10,
		speedX: rand(-10, 10) / 10,
		alpha: rand(0.5, 0.95),
		rotation: rand(0, Math.PI * 2),
		rotationSpeed: rand(-0.01, 0.01),
		shine: Math.random() < 0.35
	};
}

function drawHeart(x, y, size, color) {
	ctx.save();
	ctx.translate(x, y);
	ctx.beginPath();
	const s = size / 15;
	// Curva aproximada de coração
	ctx.moveTo(0, 3 * s);
	ctx.bezierCurveTo(0, -s, -5 * s, -s, -5 * s, 3 * s);
	ctx.bezierCurveTo(-5 * s, 7 * s, 0, 10 * s, 0, 14 * s);
	ctx.bezierCurveTo(0, 10 * s, 5 * s, 7 * s, 5 * s, 3 * s);
	ctx.bezierCurveTo(5 * s, -s, 0, -s, 0, 3 * s);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
	ctx.restore();
}

function draw() {
	ctx.clearRect(0, 0, vw, vh);
	// leve brilho de fundo
	const grad = ctx.createRadialGradient(vw * 0.3, vh * 0.2, 10, vw * 0.3, vh * 0.2, Math.max(vw, vh));
	grad.addColorStop(0, 'rgba(120,230,196,0.05)');
	grad.addColorStop(1, 'rgba(0,0,0,0)');
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, vw, vh);

	if (particles.length < 80) {
		particles.push(createHeartParticle());
	}

	for (let i = particles.length - 1; i >= 0; i -= 1) {
		const p = particles[i];
		p.y -= p.speedY;
		p.x += p.speedX * Math.sin(p.y * 0.01);
		p.rotation += p.rotationSpeed;
		p.alpha -= 0.0025;

		ctx.globalAlpha = Math.max(0, p.alpha);
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.rotate(p.rotation);
		drawHeart(0, 0, p.size, 'rgba(120,230,196,0.9)');
		if (p.shine) {
			ctx.globalAlpha *= 0.8;
			drawHeart(0, 0, p.size * 0.6, 'rgba(255,255,255,0.45)');
		}
		ctx.restore();
		ctx.globalAlpha = 1;

		if (p.y < -40 || p.alpha <= 0) {
			particles.splice(i, 1);
		}
	}
	requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

// Efeito visual global ao clicar no botão da música
const musicEffect = document.getElementById('music-effect');
// Efeito nas letras ao pressionar o botão da música ou quando a música começar a tocar
function triggerMusicEffect() {
    if (!musicEffect) return;
    musicEffect.style.display = 'block';
    musicEffect.classList.add('active');
    musicEffect.style.position = 'fixed';
    musicEffect.style.top = 0;
    musicEffect.style.left = 0;
    musicEffect.style.width = '100vw';
    musicEffect.style.height = '100vh';
    musicEffect.style.zIndex = 9999;
    musicEffect.style.pointerEvents = 'none';
    musicEffect.style.background = 'radial-gradient(circle, rgba(120,230,196,0.25) 0%, rgba(24,165,126,0.18) 60%, rgba(10,42,34,0.01) 100%)';
    musicEffect.style.transition = 'opacity 0.8s';
    musicEffect.style.opacity = '1';
    setTimeout(() => {
        musicEffect.style.opacity = '0';
        setTimeout(() => {
            musicEffect.style.display = 'none';
            musicEffect.classList.remove('active');
        }, 800);
    }, 1200);
}

// Adiciona efeito também quando a música começa a tocar automaticamente
if (audioEl) {
    audioEl.addEventListener('play', () => {
        triggerMusicEffect();
    });
}

// Tenta autoplay após carregamento
window.addEventListener('load', tryAutoplay);
// Desbloquear em primeiro toque (iOS/Android)
document.addEventListener('click', () => {
	if (audioEl && audioEl.paused) {
		try { audioEl.play(); audioToggleBtn.classList.remove('paused'); } catch {}
	}
}, { once: true });

// Estado inicial: mostrar ícone play, esconder pause, sem efeito nas letras
window.addEventListener('DOMContentLoaded', () => {
    alert('O JavaScript foi carregado!');
    document.querySelector('.icon-play').style.display = 'block';
    document.querySelector('.icon-pause').style.display = 'none';
    document.querySelectorAll('.music-animated').forEach(el => {
        el.classList.remove('music-dance');
    });
    // Corrige ícone do botão no primeiro clique
    audioToggleBtn.addEventListener('mousedown', () => {
        if (audioEl.paused) {
            document.querySelector('.icon-play').style.display = 'none';
            document.querySelector('.icon-pause').style.display = 'block';
        } else {
            document.querySelector('.icon-play').style.display = 'block';
            document.querySelector('.icon-pause').style.display = 'none';
        }
    });
});

// Frase e foto fixas
function pararTrocaFotoFrase() {
    const img = document.querySelector('.photo-frame img');
    const frase = document.querySelector('.love-quote p.music-animated');
    const autor = document.querySelector('.love-quote .signature');
    if (img && frase && autor) {
        img.src = 'foto3.jpg';
        img.alt = 'Nós dois';
        frase.textContent = '“Em qualquer vida possível, eu te encontraria e te amaria do mesmo jeito.”';
        autor.textContent = '— Para Amanda';
        img.style.border = '';
        frase.style.background = '';
        autor.style.background = '';
    }
}

function pararTrocaFoto() {
    const img = document.querySelector('.photo-frame img');
    if (img) {
        img.src = 'foto3.jpg';
        img.alt = 'Nós dois';
    }
}
