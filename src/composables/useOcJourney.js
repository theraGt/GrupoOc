import { ref, onBeforeUnmount } from 'vue'
import { onIonViewDidEnter, onIonViewWillLeave } from '@ionic/vue'

// One panorama and one vertical camera. Ionic's scroll element owns all travel.
export function useOcJourney(content, root, canvas) {
  const active = ref(0), playing = ref(false), reducedMotion = ref(false)
  const progress = ref(0), failed = ref(false)
  let viewport, chapters = [], offsets = [], image, ctx, media, observer
  let width = 0, height = 0, camera = 0, frame = 0, last = 0, navigation = null
  let enabled = false, generation = 0, pendingNavigation = null
  const removers = []
  const clamp = n => Math.max(0, Math.min(1, n))
  const ease = n => n * n * (3 - 2 * n)
  function listen(target, type, callback, options) {
    target.addEventListener(type, callback, options)
    removers.push(() => target.removeEventListener(type, callback, options))
  }
  function stop() { playing.value = false; navigation = null }
  function destination() {
    let index = 0
    for (let i = 1; i < offsets.length; i++) if (viewport.scrollTop >= offsets[i]) index = i
    return index === 3 ? 3 : index + clamp((viewport.scrollTop - offsets[index]) / (offsets[index + 1] - offsets[index]))
  }
  function paint() {
    if (!image?.naturalWidth || !ctx) return
    const scale = Math.max(width / image.naturalWidth, height * 3 / image.naturalHeight)
    const drawWidth = image.naturalWidth * scale, drawHeight = image.naturalHeight * scale
    const x = (width - drawWidth) * (width <= 600 ? .68 : .5)
    const y = -Math.max(0, drawHeight - height) * clamp(camera / 3)
    ctx.drawImage(image, x, y, drawWidth, drawHeight)
    Object.assign(canvas.value.dataset, { scene: String(Math.min(3, Math.floor(camera))), progress: camera.toFixed(4), cameraY: y.toFixed(3), cameraScale: scale.toFixed(5) })
    progress.value = clamp(camera / 3)
  }
  function schedule() { if (enabled && viewport && !frame) frame = requestAnimationFrame(update) }
  function update(now) {
    frame = 0
    if (!enabled) return
    const dt = Math.min(40, now - last || 16); last = now
    if (navigation) {
      const t = clamp((now - navigation.start) / 1500)
      viewport.scrollTop = navigation.from + (navigation.to - navigation.from) * ease(t)
      if (t === 1) navigation = null
    } else if (playing.value) {
      viewport.scrollTop = Math.min(offsets[3], viewport.scrollTop + dt * offsets[3] / 65000)
      if (viewport.scrollTop >= offsets[3] - 1) playing.value = false
    }
    const desired = destination()
    camera = reducedMotion.value ? desired : camera + (desired - camera) * (1 - Math.exp(-dt / 190))
    if (Math.abs(desired - camera) < .0001) camera = desired
    active.value = Math.min(3, Math.floor(desired + .015))
    paint()
    if (playing.value || navigation || Math.abs(camera - desired) > .0001) schedule()
  }
  function measure(force = false) {
    if (!viewport || !canvas.value) return
    const newWidth = viewport.clientWidth, newHeight = viewport.clientHeight
    const changed = force || newWidth !== width || (newWidth > 600 && newHeight !== height)
    if (changed) {
      width = newWidth; height = newHeight
      const dpr = Math.min(devicePixelRatio || 1, 2)
      canvas.value.width = Math.round(width * dpr); canvas.value.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    offsets = chapters.map(section => section.offsetTop)
    schedule()
  }
  function navigate(id) {
    // A cached Ionic page is visible during its entrance transition, before
    // DidEnter. Keep clicks received in that interval instead of dropping them.
    if (!enabled || !viewport) { pendingNavigation = id; return }
    const index = chapters.findIndex(section => section.id === id)
    if (index < 0) return
    stop()
    if (reducedMotion.value) viewport.scrollTop = offsets[index]
    else navigation = { from: viewport.scrollTop, to: offsets[index], start: performance.now() }
    schedule()
  }
  function togglePlayback() {
    if (!enabled || reducedMotion.value || failed.value) return
    navigation = null
    if (!playing.value && viewport.scrollTop >= offsets[3] - 1) viewport.scrollTop = 0
    playing.value = !playing.value
    schedule()
  }
  function cleanup() {
    enabled = false; generation++; stop(); cancelAnimationFrame(frame); frame = 0
    observer?.disconnect(); observer = null
    removers.splice(0).forEach(remove => remove())
    if (image) { image.onload = null; image.onerror = null }
  }
  async function start() {
    cleanup()
    const token = generation
    const scrollElement = await content.value.$el.getScrollElement()
    if (token !== generation || !canvas.value) return
    viewport = scrollElement; enabled = true; failed.value = false; last = 0
    chapters = [...root.value.$el.querySelectorAll('.chapter')]
    ctx = canvas.value.getContext('2d', { alpha: false })
    media = matchMedia('(prefers-reduced-motion: reduce)'); reducedMotion.value = media.matches
    listen(media, 'change', () => { reducedMotion.value = media.matches; stop(); schedule() })
    listen(viewport, 'scroll', schedule, { passive: true })
    listen(viewport, 'wheel', stop, { passive: true })
    listen(viewport, 'touchstart', stop, { passive: true })
    listen(document, 'keydown', event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) stop() })
    listen(document, 'visibilitychange', () => { if (document.hidden) stop() })
    observer = new ResizeObserver(() => measure())
    observer.observe(viewport); chapters.forEach(section => observer.observe(section))
    image = new Image()
    image.onload = () => { if (enabled && token === generation) { measure(true); camera = destination(); paint() } }
    image.onerror = () => { if (enabled && token === generation) { failed.value = true; stop() } }
    image.src = '/oc-recorrido/assets/edificio-continuo-oc.png'
    measure(true); camera = destination(); schedule()
    if (pendingNavigation) {
      const id = pendingNavigation; pendingNavigation = null; navigate(id)
    }
  }
  onIonViewDidEnter(start)
  onIonViewWillLeave(cleanup)
  onBeforeUnmount(cleanup)
  return { active, playing, reducedMotion, failed, progress, navigate, togglePlayback, stop }
}
