/* Continuous OC panorama. Scroll controls a single uniform camera translation.
   No image swaps, dissolves, section-dependent crops or fabricated 3D geometry. */
(() => {
  'use strict';
  const canvas = document.querySelector('#architecture');
  const ctx = canvas.getContext('2d', { alpha: false });
  const image = new Image();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const chapters = [...document.querySelectorAll('.chapter')];
  const titles = ['AZOTEA', 'NOSOTROS', 'PROPIEDADES', 'VESTÍBULO'];
  const lights = ['AZOTEA Y TERRAZAS', 'NIVELES INTERMEDIOS', 'JARDINES Y RESIDENCIAS', 'VESTÍBULO'];
  const links = [...document.querySelectorAll('nav a, .route a')];
  const play = document.querySelector('#play');
  const progress = document.querySelector('#progress');
  let width = innerWidth, height = innerHeight, offsets = [];
  let camera = 0, desired = 0, playing = false, raf = 0, last = 0, current = -1;
  let navigation = null;
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const ease = n => n * n * (3 - 2 * n);

  function measure() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    offsets = chapters.map(chapter => chapter.offsetTop);
    schedule();
  }
  function readProgress() {
    const y = scrollY;
    let index = 0;
    for (let i = 1; i < offsets.length; i++) if (y >= offsets[i]) index = i;
    if (index === 3) return 3;
    return index + clamp((y - offsets[index]) / (offsets[index + 1] - offsets[index]));
  }
  function paint() {
    if (!image.complete || !image.naturalWidth) return;
    const progressValue = clamp(camera / 3);
    // One view of one building, at the same scale and horizontal position for
    // every chapter. Only Y changes, including across chapter boundaries.
    const scale = Math.max(width / image.naturalWidth, height * 3 / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const x = (width - drawWidth) * (mobile.matches ? .68 : .5);
    const travel = Math.max(0, drawHeight - height);
    const y = -travel * progressValue;
    ctx.globalAlpha = 1;
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    progress.style.transform = `scaleX(${progressValue})`;
    canvas.dataset.scene = String(Math.min(3, Math.floor(camera)));
    canvas.dataset.progress = camera.toFixed(4);
    canvas.dataset.cameraY = y.toFixed(3);
    canvas.dataset.cameraScale = scale.toFixed(5);
  }
  function setPlaying(value) {
    playing = value && !reduced.matches;
    play.setAttribute('aria-pressed', String(playing));
    document.querySelector('#play-label').textContent = playing ? 'Pausar recorrido' : 'Reproducir recorrido';
    document.querySelector('#play-icon').textContent = playing ? 'Ⅱ' : '▷';
    if (playing) schedule();
  }
  function update(now) {
    raf = 0;
    const dt = Math.min(40, now - last || 16); last = now;
    if (navigation) {
      const t = clamp((now - navigation.start) / navigation.duration);
      scrollTo(0, navigation.from + (navigation.to - navigation.from) * ease(t));
      if (t === 1) navigation = null;
    } else if (playing) {
      const end = offsets[3];
      scrollTo(0, Math.min(end, scrollY + dt * end / 65000));
      if (scrollY >= end - 1) setPlaying(false);
    }
    desired = readProgress();
    camera = reduced.matches ? desired : camera + (desired - camera) * (1 - Math.exp(-dt / 190));
    if (Math.abs(desired - camera) < .0001) camera = desired;
    const index = Math.min(3, Math.floor(desired + .015));
    if (index !== current) {
      current = index;
      document.body.dataset.chapter = String(index);
      links.forEach(link => link.hash === '#' + chapters[index].id ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
      document.querySelector('#chapter-number').textContent = `0${index + 1} / 04`;
      document.querySelector('#chapter-name').textContent = titles[index];
      document.querySelector('#lighting').textContent = lights[index];
    }
    paint();
    if (playing || navigation || Math.abs(camera - desired) > .0001) schedule();
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(update); }
  function go(id) {
    const index = chapters.findIndex(chapter => chapter.id === id);
    if (index < 0) return;
    setPlaying(false);
    if (reduced.matches) { navigation = null; scrollTo(0, offsets[index]); }
    else navigation = { from: scrollY, to: offsets[index], start: performance.now(), duration: 1500 };
    history.replaceState(null, '', '#' + id);
    schedule();
  }
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    event.preventDefault(); closeMenu(); go(anchor.hash.slice(1));
  });
  const menu = document.querySelector('.menu-toggle');
  function closeMenu() { document.body.classList.remove('menu-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menú'); }
  menu.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  const interrupt = () => { navigation = null; setPlaying(false); };
  addEventListener('wheel', interrupt, { passive: true });
  addEventListener('touchstart', interrupt, { passive: true });
  addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) interrupt();
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => {
    // Ignore mobile browser chrome height changes to keep framing stable.
    if (mobile.matches && innerWidth === width) return;
    measure();
  });
  reduced.addEventListener('change', () => { interrupt(); play.disabled = reduced.matches; schedule(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) interrupt(); });
  play.addEventListener('click', () => {
    navigation = null;
    if (!playing && scrollY >= offsets[3] - 1) scrollTo(0, 0);
    setPlaying(!playing);
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('.property').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.type !== button.dataset.filter; });
    document.querySelector('.properties').scrollLeft = 0;
  }));
  function crop(element, data) {
    const [x, y, w, h] = data.split(',').map(Number);
    const picture = document.createElement('img');
    picture.src = 'assets/recorrido-original.png'; picture.alt = ''; picture.decoding = 'async';
    element.style.aspectRatio = `${w}/${h}`;
    picture.style.cssText = `width:${1024 / w * 100}%;left:${-x / w * 100}%;top:${-y / h * 100}%;`;
    element.replaceChildren(picture);
  }
  document.querySelectorAll('[data-crop]').forEach(element => crop(element, element.dataset.crop));
  const dialog = document.querySelector('dialog');
  document.querySelectorAll('[data-property]').forEach(card => card.addEventListener('click', () => {
    interrupt();
    document.querySelector('#property-title').textContent = card.dataset.property;
    crop(document.querySelector('#property-preview'), card.querySelector('[data-crop]').dataset.crop);
    dialog.showModal();
  }));
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  document.querySelector('#ask-property').addEventListener('click', () => {
    document.querySelector('[name=mensaje]').value = `Me interesa recibir información sobre ${document.querySelector('#property-title').textContent}.`;
    dialog.close(); go('contacto');
  });
  document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.target);
    const text = `OC GRUPO INMOBILIARIO\nConsulta conceptual\n\nNombre: ${data.get('nombre')}\nCorreo: ${data.get('correo')}\n\n${data.get('mensaje')}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'consulta-grupo-oc.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.querySelector('#form-status').textContent = 'Consulta preparada. No se ha enviado ningún mensaje.';
  });
  image.onload = () => { measure(); if (location.hash) go(location.hash.slice(1)); };
  image.onerror = () => { document.querySelector('#lighting').textContent = 'IMAGEN NO DISPONIBLE'; setPlaying(false); play.disabled = true; };
  image.src = 'assets/edificio-continuo-oc.png';
  play.disabled = reduced.matches;
  measure();
})();
