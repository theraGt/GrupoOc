<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { land } from '../data/ocLand'

const props = defineProps({ active: Boolean })
defineEmits(['back'])
const root = ref(null), index = ref(0), mode = ref('actual'), paused = ref(false), visible = ref(false), reduced = ref(false)
const caption = computed(() => mode.value === 'actual' ? 'Estado actual · Color realzado' : 'Vista despejada · Concepto visual')
const frames = land.photos.flatMap((photo, index) => ['actual', 'cleared'].map(mode => ({ index, mode, src: photo[mode], label: photo.label })))
let timer, observer, media
function schedule() {
  clearTimeout(timer)
  if (!props.active || paused.value || !visible.value || document.hidden) return
  timer = setTimeout(() => {
    index.value++
    if (index.value === land.photos.length) {
      index.value = 0
      mode.value = mode.value === 'actual' ? 'cleared' : 'actual'
    }
    schedule()
  }, 2500)
}
function chooseMode(value) { mode.value = value; index.value = 0; schedule() }
function choosePhoto(value) { index.value = value; schedule() }
function togglePlayback() { paused.value = !paused.value; schedule() }
function updateMotion() { reduced.value = media.matches; paused.value = media.matches; schedule() }
watch(() => props.active, schedule)
watch(visible, schedule)
onMounted(() => {
  media = matchMedia('(prefers-reduced-motion: reduce)')
  updateMotion()
  media.addEventListener('change', updateMotion)
  document.addEventListener('visibilitychange', schedule)
  observer = new IntersectionObserver(entries => { visible.value = entries[0].isIntersecting }, { threshold: .15 })
  observer.observe(root.value)
})
onBeforeUnmount(() => {
  clearTimeout(timer); observer?.disconnect()
  media?.removeEventListener('change', updateMotion)
  document.removeEventListener('visibilitychange', schedule)
})
</script>

<template>
  <section ref="root" class="land-hero-carousel" :class="{ 'reduced-motion': reduced, paused }" :data-mode="mode" :data-index="index" aria-labelledby="land-title" aria-roledescription="carrusel">
    <div class="hero-frames" aria-hidden="true">
      <img v-for="frame in frames" :key="frame.src" class="hero-photo" :class="{ 'is-active': frame.index === index && frame.mode === mode }" :src="frame.src" alt="" :fetchpriority="frame.index === 0 && frame.mode === 'actual' ? 'high' : 'auto'" decoding="async">
    </div>
    <div class="hero-overlay"></div>
    <div class="hero-topline"><button class="back-link" @click="$emit('back')">← Volver a propiedades</button><p>COLONIA EL CORTIJO <span>VILLA NUEVA · EN VENTA</span></p></div>
    <div class="hero-story">
      <p class="hero-eyebrow">UNA NUEVA PERSPECTIVA</p>
      <h1 id="land-title">Imagina lo que viene.</h1>
      <div class="hero-mode" role="group" aria-label="Estado del terreno en portada"><button :aria-pressed="mode === 'actual'" @click="chooseMode('actual')">Estado actual</button><button :aria-pressed="mode === 'cleared'" @click="chooseMode('cleared')">Terreno despejado</button></div>
      <p class="hero-view-name">{{ land.photos[index].label }}</p>
      <p class="hero-state-caption">{{ caption }}</p>
    </div>
    <nav class="hero-dots" aria-label="Fotografías de portada"><button v-for="(photo, position) in land.photos" :key="photo.label" :aria-label="`Portada: ${photo.label}`" :aria-current="position === index ? 'true' : undefined" @click="choosePhoto(position)"><span></span></button></nav>
    <div class="hero-bottom"><button class="hero-playback" :aria-pressed="!paused" @click="togglePlayback">{{ paused ? 'Reproducir recorrido ▷' : 'Pausar recorrido Ⅱ' }}</button><span class="hero-count"><b>{{ String(index + 1).padStart(2, '0') }}</b> / 06</span></div>
    <div class="hero-progress" aria-hidden="true"><span :style="{ width: `${(index + 1) / land.photos.length * 100}%` }"></span></div>
  </section>
</template>

<style scoped>
.land-hero-carousel{position:relative;height:100svh;min-height:680px;overflow:hidden;background:#00294c;color:#f1eee6;font-family:Metropolis,Arial,sans-serif}
.hero-frames,.hero-overlay{position:absolute;inset:0}.hero-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.025);transition:opacity .85s ease,transform 4s linear;pointer-events:none}.hero-photo.is-active{opacity:1;transform:scale(1.065)}.hero-overlay{background:linear-gradient(0deg,#00000eb3,transparent 65%),linear-gradient(90deg,#00294c44,transparent 75%)}.hero-topline{position:absolute;top:134px;left:6.5%;right:6.5%}.back-link{background:none;border:0;padding:0;color:inherit;font:inherit;font-size:10px;cursor:pointer;margin-bottom:22px}.hero-topline p{font-size:12px;letter-spacing:2.7px;margin:0;text-shadow:0 1px 10px #000}.hero-topline p span{margin-left:25px;padding-left:25px;border-left:1px solid #f1eee680;font-size:10px;letter-spacing:1.7px}.hero-story{position:absolute;bottom:70px;left:6.5%;right:12%}.hero-eyebrow{font-size:11px;letter-spacing:3px;margin:0 0 22px}.hero-story h1{font-size:clamp(42px,5.6vw,85px);font-weight:400;line-height:1.08;letter-spacing:-.045em;margin:0 0 30px}.hero-mode{display:inline-flex;gap:4px;border:1px solid #dcab7666;background:#00294cd9;padding:5px;backdrop-filter:blur(12px)}.hero-mode button{font:inherit;border:0;background:none;color:inherit;font-size:12px;padding:15px 24px;cursor:pointer}.hero-mode button[aria-pressed=true]{color:#00000e;background:#dcab76}.hero-view-name{font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:18px 0 9px}.hero-state-caption{font-size:11px;color:#f1eee6cc;margin:0}.hero-dots{position:absolute;right:3%;top:40%;display:flex;flex-direction:column;gap:8px}.hero-dots button{border:0;background:none;width:36px;height:36px;padding:10px;display:grid;place-items:center;cursor:pointer}.hero-dots span{width:6px;height:6px;background:#f1eee677;border-radius:50%;transition:transform .3s,background .3s}.hero-dots button[aria-current=true] span{background:#f1eee6;transform:scale(1.6);box-shadow:0 0 0 7px #f1eee615}.hero-bottom{position:absolute;bottom:24px;left:6.5%;right:6.5%;display:flex;justify-content:flex-end;align-items:center;gap:40px}.hero-playback{font:inherit;background:none;border:0;border-bottom:1px solid #f1eee666;padding:8px 0;font-size:11px;color:inherit;cursor:pointer;position:absolute;left:50%;transform:translateX(-50%)}.hero-count{font-size:11px;color:#f1eee6a6}.hero-count b{font-size:28px;font-weight:300;color:#f1eee6;margin-right:5px}.hero-progress{position:absolute;bottom:0;left:0;width:100%;height:2px;background:#f1eee61a}.hero-progress span{display:block;height:100%;background:#dcab76;transition:width .65s ease}button:focus-visible{outline:2px solid #dcab76;outline-offset:5px}.paused .hero-photo{transition-property:opacity}.reduced-motion .hero-photo{transition:none;transform:none}.reduced-motion .hero-progress span{transition:none}
@media(max-width:600px){.land-hero-carousel{min-height:700px}.hero-topline{top:113px;left:6%;right:6%}.back-link{margin-bottom:22px;font-size:9px}.hero-topline p{font-size:10px;letter-spacing:2px;line-height:1.8}.hero-topline p span{display:block;margin:0;padding:0;border:0;font-size:9px;letter-spacing:1.7px}.hero-photo{object-position:52% center}.hero-story{left:6%;right:12%;bottom:94px}.hero-story h1{font-size:43px;max-width:325px;margin-bottom:25px}.hero-eyebrow{font-size:9px;letter-spacing:2px;margin-bottom:18px}.hero-mode{gap:2px;padding:4px}.hero-mode button{font-size:10px;padding:13px 14px}.hero-view-name{font-size:9px;letter-spacing:1.5px}.hero-state-caption{font-size:10px}.hero-dots{right:1%;top:32%;gap:0}.hero-dots button{width:32px;height:32px}.hero-dots span{width:5px;height:5px}.hero-bottom{left:6%;right:6%;bottom:23px}.hero-playback{left:0;transform:none;font-size:10px}.hero-count b{font-size:26px}}
@media(prefers-reduced-motion:reduce){.hero-photo{transition:none;transform:none}.hero-progress span{transition:none}}
</style>
