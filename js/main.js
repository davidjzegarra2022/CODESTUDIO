// ===== WhatsApp: todos los enlaces de contacto usan este número =====
const WHATSAPP = "51962029292";
const BASE_MSG = "Hola, mi nombre es .... y me gustaría digitalizar mi negocio en línea.";

const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

document.querySelectorAll('[data-wa]').forEach(a => {
  const plan = a.dataset.wa;
  a.href = waLink(plan ? `${BASE_MSG} Me interesa el plan ${plan}.` : BASE_MSG);
  a.target = '_blank';
  a.rel = 'noopener';
});

// Formulario → WhatsApp con el nombre real
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  let msg = `Hola, mi nombre es ${f.get('nombre').trim()} y me gustaría digitalizar mi negocio en línea.`;
  if (f.get('empresa')) msg += `\nNegocio: ${f.get('empresa')}`;
  msg += `\nServicio: ${f.get('plan')}`;
  if (f.get('mensaje')) msg += `\n${f.get('mensaje')}`;
  window.open(waLink(msg), '_blank');
});

document.getElementById('year').textContent = new Date().getFullYear();

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Menú =====
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => { burger.classList.toggle('open'); menu.classList.toggle('open'); });
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); }));

// ===== Separar palabras =====
function splitWords(el, cls = 'w') {
  const walk = (node) => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.append(part);
          else { const s = document.createElement('span'); s.className = cls; s.textContent = part; frag.append(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  return el.querySelectorAll('.' + cls);
}

// Título del hero: palabras que aparecen con desenfoque
splitWords(document.getElementById('heroTitle')).forEach((w, i) => w.style.animationDelay = `${.25 + i * .12}s`);
// Texto que se ilumina al hacer scroll
const scrubWords = [...splitWords(document.getElementById('scrubText'))];

// ===== Aparición al hacer scroll =====
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => {
  // escalonar elementos hermanos
  const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  el.style.setProperty('--d', `${Math.min(sibs.indexOf(el), 5) * .08}s`);
  io.observe(el);
});

// ===== Contadores =====
const cio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    cio.unobserve(el);
  });
}, { threshold: .6 });
document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

// ===== Efectos ligados al scroll =====
const progress = document.getElementById('progress');
const heroInner = document.getElementById('heroInner');
const scrub = document.querySelector('.scrub');
const promo = document.getElementById('promo');
const promoTitle = document.getElementById('promoTitle');
const steps = [...document.querySelectorAll('.step')];
const stepsBox = document.getElementById('steps');
const processBar = document.getElementById('processBar');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sectionProgress = (el) => {
  const r = el.getBoundingClientRect();
  return clamp(-r.top / (r.height - innerHeight));
};

function onScroll() {
  const y = scrollY, vh = innerHeight;
  nav.classList.toggle('scrolled', y > 10);
  progress.style.transform = `scaleX(${y / (document.documentElement.scrollHeight - vh)})`;

  if (reduce) { scrubWords.forEach(w => w.classList.add('on')); steps.forEach(s => s.classList.add('active')); return; }

  // Hero: se aleja y se desvanece
  const hp = clamp(y / vh);
  heroInner.style.transform = `translateY(${hp * 120}px) scale(${1 - hp * .12})`;
  heroInner.style.opacity = 1 - hp * 1.3;

  // Texto que se ilumina palabra por palabra
  const sp = sectionProgress(scrub);
  const lit = Math.floor(sp * 1.15 * scrubWords.length);
  scrubWords.forEach((w, i) => w.classList.toggle('on', i < lit));

  // Promo: zoom
  const pp = sectionProgress(promo);
  const z = clamp(pp / .6);
  promoTitle.style.setProperty('--s', (.62 + z * .38).toFixed(3));
  promoTitle.style.setProperty('--o', (.25 + z * .75).toFixed(3));

  // Proceso: paso activo
  let active = 0;
  steps.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * .6) active = i; });
  steps.forEach((s, i) => s.classList.toggle('active', i === active));
  const br = stepsBox.getBoundingClientRect();
  processBar.style.transform = `scaleX(${clamp((vh * .6 - br.top) / br.height)})`;
}
let ticking = false;
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; } }, { passive: true });
addEventListener('resize', onScroll);
onScroll();

// ===== Inclinación 3D + brillo que sigue al cursor =====
if (!reduce && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tile, .plan').forEach(card => {
    card.addEventListener('mousemove', e => {
      if (!card.classList.contains('in')) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, yy = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${yy * 100}%`);
      card.style.transform = `perspective(1000px) rotateX(${(.5 - yy) * 5}deg) rotateY(${(x - .5) * 5}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ===== Galería horizontal =====
const gallery = document.getElementById('gallery');
const step = () => gallery.querySelector('.g-card').offsetWidth + 20;
document.getElementById('gPrev').addEventListener('click', () => gallery.scrollBy({ left: -step(), behavior: 'smooth' }));
document.getElementById('gNext').addEventListener('click', () => gallery.scrollBy({ left: step(), behavior: 'smooth' }));
