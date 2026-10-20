// ==== CONFIGURACIÓN: cambia aquí tu número de WhatsApp (con código de país, sin +) ====
const WHATSAPP = "51900000000";

const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// Nav con sombra al hacer scroll
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20));

// Menú móvil
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => { burger.classList.toggle('open'); menu.classList.toggle('open'); });
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); }));

// Animación al aparecer
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Contadores
const counters = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count; let n = 0;
    const step = Math.max(1, Math.ceil(end / 50));
    const t = setInterval(() => { n += step; if (n >= end) { n = end; clearInterval(t); } el.textContent = n; }, 30);
    counters.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => counters.observe(el));

// Botones de planes preseleccionan el servicio
const planSel = document.getElementById('planSel');
document.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => { planSel.value = b.dataset.plan; }));

// Formulario → WhatsApp
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const msg = `Hola Code Studio 👋\nNombre: ${f.get('nombre')}\nNegocio: ${f.get('empresa') || '-'}\nServicio: ${f.get('plan')}\nMensaje: ${f.get('mensaje') || '-'}`;
  window.open(waLink(msg), '_blank');
});

// Botón flotante
document.getElementById('waFloat').href = waLink('Hola Code Studio, quiero información sobre una página web 🚀');

document.getElementById('year').textContent = new Date().getFullYear();
