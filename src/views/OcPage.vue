<script setup>
import { computed, nextTick, reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { land } from '../data/ocLand'
import { IonPage, IonContent, onIonViewDidEnter, onIonViewWillLeave } from '@ionic/vue'
import { useOcJourney } from '../composables/useOcJourney'
import OcPropertyImage from '../components/OcPropertyImage.vue'

const router = useRouter(), route = useRoute()
const root = ref(null), content = ref(null), canvas = ref(null), dialog = ref(null), gallery = ref(null)
const { active, playing, reducedMotion, failed, progress, navigate, togglePlayback, stop } = useOcJourney(content, root, canvas)
const menuOpen = ref(false), filter = ref('all'), formStatus = ref('')
const sections = [
  { id: 'inicio', label: 'Inicio', short: 'AZOTEA', detail: 'AZOTEA Y TERRAZAS' },
  { id: 'nosotros', label: 'Nosotros', short: 'NOSOTROS', detail: 'NIVELES INTERMEDIOS' },
  { id: 'propiedades', label: 'Propiedades', short: 'PROPIEDADES', detail: 'JARDINES Y RESIDENCIAS' },
  { id: 'contacto', label: 'Contacto', short: 'VESTÍBULO', detail: 'VESTÍBULO' },
]
const filters = [{ value: 'all', label: 'Todas' }, { value: 'casa', label: 'Casas' }, { value: 'terreno', label: 'Terrenos' }]
const properties = [
  { name: 'Casa con jardín', type: 'casa', crop: [50, 1010, 235, 100] },
  { name: 'El Cortijo · Villa Nueva', type: 'terreno', image: land.photos[2].actual, route: '/oc/propiedades/terreno-villa-nueva' },
  { name: 'Casa contemporánea', type: 'casa', crop: [538, 1010, 217, 100] },
]
const selected = ref(properties[0])
const visibleProperties = computed(() => properties.filter(item => filter.value === 'all' || item.type === filter.value))
const form = reactive({ name: '', email: '', message: '' })
function handleNavigation(event) {
  if (event.defaultPrevented) return
  const link = event.target.closest('a[href^="#"]')
  if (!link) return
  event.preventDefault(); menuOpen.value = false; navigate(link.hash.slice(1))
}
async function setFilter(value) { filter.value = value; await nextTick(); gallery.value.scrollLeft = 0 }
function selectProperty(property) {
  stop()
  if (property.route) { router.push(property.route); return }
  selected.value = property; dialog.value.showModal()
}
function closeOnBackdrop(event) {
  if (event.target !== dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.value.close()
}
function askProperty() {
  form.message = `Me interesa recibir información sobre ${selected.value.name}.`
  dialog.value.close(); navigate('contacto')
}
function downloadInquiry() {
  const text = `OC GRUPO INMOBILIARIO\nConsulta conceptual\n\nNombre: ${form.name}\nCorreo: ${form.email}\n\n${form.message}\n`
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = 'consulta-grupo-oc.txt'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  formStatus.value = 'Consulta preparada. No se ha enviado ningún mensaje.'
}
function keydown(event) { if (event.key === 'Escape') menuOpen.value = false }
onMounted(() => document.addEventListener('keydown', keydown))
onBeforeUnmount(() => document.removeEventListener('keydown', keydown))
onIonViewDidEnter(() => { if (route.query.section === 'propiedades') navigate('propiedades') })
onIonViewWillLeave(() => { menuOpen.value = false; dialog.value?.close() })
</script>

<template>
  <IonPage ref="root" class="oc-page" :class="{ 'menu-open': menuOpen }" :data-chapter="active" @click="handleNavigation">
  <div class="world" aria-hidden="true">
    <canvas ref="canvas" id="architecture"></canvas>
    <div class="shade"></div>
    <div class="edge-line"></div>
  </div>
    <IonContent ref="content" :fullscreen="true">

  <a slot="fixed" class="skip" href="#inicio">Ir al contenido</a>
  <header slot="fixed">
    <a class="brand" href="#inicio" aria-label="OC Grupo Inmobiliario · Inicio"><img src="/oc-recorrido/assets/oc-logo.svg" width="110" height="91" alt="OC Grupo Inmobiliario"></a>
    <button class="menu-toggle" :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen" aria-controls="main-nav"><span></span><span></span><span></span></button>
    <nav id="main-nav" aria-label="Navegación principal">
      <a v-for="(section, index) in sections" :key="section.id" :href="`#${section.id}`" :aria-current="active === index ? 'location' : undefined">{{ section.label }}</a>
    </nav>
    <a href="#contacto" class="header-contact">Hablemos <span>↗</span></a>
  </header>
  <main>
    <section id="inicio" class="chapter" aria-labelledby="title-inicio">
      <div class="chapter-inner"><div class="copy">
        <p class="eyebrow"><span></span> TERRENOS Y CASAS EN GUATEMALA</p>
        <h1 id="title-inicio">Tu próximo<br>capítulo<br>comienza aquí.</h1>
        <p class="description">Terrenos para imaginar.<br>Casas para vivir. Un lugar para ti.</p>
        <a class="button" href="#propiedades">Explorar propiedades <span>↗</span></a>
        <a class="scroll-invitation" href="#nosotros"><span class="scroll-track"><i></i></span> Desliza para descubrir</a>
      </div><p class="architect-note">01 — AZOTEA & TERRAZAS<span>Un horizonte de posibilidades.</span></p></div>
    </section>
    <section id="nosotros" class="chapter" aria-labelledby="title-nosotros">
      <div class="chapter-inner"><div class="copy">
        <p class="eyebrow"><span></span> NOSOTROS</p>
        <h2 id="title-nosotros">Visión que<br>construye<br>confianza.</h2>
        <p class="description">Cada búsqueda comienza con una idea de futuro. Queremos ayudarte a encontrar el espacio para hacerla realidad.</p>
        <div class="values"><article><span>Misión</span><p>Conectar personas con su próximo hogar.</p></article><article><span>Visión</span><p>Crear nuevas oportunidades en Guatemala.</p></article></div>
        <a class="text-link" href="#propiedades">Encuentra tu lugar <span>↓</span></a>
      </div><p class="architect-note">02 — NIVELES RESIDENCIALES<span>Arquitectura que acompaña tu vida.</span></p></div>
    </section>
    <section id="propiedades" class="chapter" aria-labelledby="title-propiedades">
      <div class="chapter-inner"><div class="copy gallery-copy">
        <p class="eyebrow"><span></span> PROPIEDADES</p>
        <h2 id="title-propiedades">Encuentra tu<br>próximo lugar.</h2>
        <p class="description">Explora distintas maneras de imaginar tu futuro.</p>
        <div class="filters" role="group" aria-label="Filtrar propiedades"><button v-for="option in filters" :key="option.value" :data-filter="option.value" :aria-pressed="filter === option.value" @click="setFilter(option.value)">{{ option.label }}</button></div>
        <div ref="gallery" class="properties">
          <button v-for="property in visibleProperties" :key="property.name" class="property" :data-type="property.type" :data-property="property.name" @click="selectProperty(property)">
            <span v-if="property.image" class="property-image land-card-photo"><img :src="property.image" alt="Terreno El Cortijo en Villa Nueva" loading="lazy"></span><OcPropertyImage v-else :crop="property.crop" />
            <span class="property-detail"><small>{{ property.type === 'casa' ? 'CASAS' : 'TERRENOS' }}</small><strong>{{ property.name }}</strong><b>↗</b></span>
          </button>
        </div>
        <p class="concept-note">El Cortijo: ficha disponible · Casas: propuestas conceptuales</p>
      </div><p class="architect-note">03 — ESPACIOS PARA ELEGIR<span>Una nueva forma de vivir e invertir.</span></p></div>
    </section>
    <section id="contacto" class="chapter" aria-labelledby="title-contacto">
      <div class="chapter-inner"><div class="copy contact-copy">
        <p class="eyebrow"><span></span> CONTACTO</p>
        <h2 id="title-contacto">Conversemos<br>sobre tu próximo<br>hogar.</h2>
        <form id="contact-form" @submit.prevent="downloadInquiry">
          <div class="form-row"><label>Tu nombre<input v-model="form.name" name="nombre" autocomplete="name" placeholder="Nombre completo" required></label><label>Tu correo<input v-model="form.email" name="correo" type="email" autocomplete="email" placeholder="tu@correo.com" required></label></div>
          <label>¿Qué estás buscando?<textarea v-model="form.message" name="mensaje" rows="2" placeholder="Una casa, un terreno, una nueva oportunidad…" required></textarea></label>
          <button class="button" type="submit">Preparar consulta <span>↗</span></button>
          <p class="concept-note">Demo: descarga tu consulta. No se envían datos.</p>
          <p id="form-status" role="status">{{ formStatus }}</p>
        </form>
      </div><p class="architect-note">04 — BIENVENIDO A CASA<span>OC Grupo Inmobiliario · Guatemala</span></p></div>
    </section>
  </main>
  <footer class="oc-home-footer">
    <div class="home-footer-brand"><img src="/oc-recorrido/assets/oc-logo.svg" alt="OC Grupo Inmobiliario"><div><p>Tu próxima inversión,<br>nuestra prioridad.</p><span>Terrenos y casas en Guatemala</span></div></div>
    <nav class="home-footer-socials" aria-label="Redes sociales de Grupo OC">
      <p>Conoce más de Grupo OC</p>
      <div class="home-social-links">
        <a href="https://www.youtube.com/@GrupoOC_Inmobiliaria" target="_blank" rel="noopener noreferrer">YouTube <span aria-hidden="true">↗</span></a>
        <a href="https://www.instagram.com/ocinmobiliariaoficial?dlrf=Zmp6Y2F0c3l1cGF5" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
        <a href="https://www.facebook.com/share/1HrYeYyZsU/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">Facebook <span aria-hidden="true">↗</span></a>
        <a href="https://www.tiktok.com/@grupo.inmobiliario.oc?_r=1&amp;_t=ZP-9B71WqZyq47" target="_blank" rel="noopener noreferrer">TikTok <span aria-hidden="true">↗</span></a>
      </div>
    </nav>
    <div class="home-footer-bottom"><span>© {{ new Date().getFullYear() }} OC Grupo Inmobiliario</span><a href="#inicio">Volver al inicio ↑</a></div>
  </footer>
  <div slot="fixed" class="hud">
    <div class="chapter-status"><span id="chapter-number">0{{ active + 1 }} / 04</span><span class="separator"></span><span id="chapter-name">{{ sections[active].short }}</span></div>
    <button id="play" type="button" :aria-pressed="playing" :disabled="reducedMotion || failed" @click="togglePlayback"><span id="play-icon">{{ playing ? 'Ⅱ' : '▷' }}</span><span id="play-label">{{ playing ? 'Pausar recorrido' : 'Reproducir recorrido' }}</span></button>
    <span class="lighting" id="lighting">{{ failed ? 'IMAGEN NO DISPONIBLE' : sections[active].detail }}</span>
    <div class="progress-track"><span id="progress" :style="{ transform: `scaleX(${progress})` }"></span></div>
  </div>
  <dialog ref="dialog" id="property-dialog" aria-labelledby="property-title" @click="closeOnBackdrop">
    <button class="close" aria-label="Cerrar" @click="dialog.close()">×</button><p class="eyebrow">TU PRÓXIMO LUGAR</p><h2 id="property-title">{{ selected.name }}</h2><OcPropertyImage id="property-preview" :crop="selected.crop" /><p>Una propuesta para imaginar tu próximo capítulo en Guatemala.</p><p class="concept-note">Propiedad conceptual. No representa un anuncio disponible.</p><button class="button" id="ask-property" @click="askProperty">Quiero más información <span>↗</span></button>
  </dialog>
    </IonContent>
  </IonPage>
</template>
<style scoped src="../theme/oc.css"></style>
