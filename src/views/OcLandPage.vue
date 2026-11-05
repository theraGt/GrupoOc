<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, onIonViewDidEnter, onIonViewWillLeave } from '@ionic/vue'
import OcLandHero from '../components/OcLandHero.vue'
import { land, landWhatsApp } from '../data/ocLand'

const heroActive = ref(false)
const router = useRouter(), content = ref(null), root = ref(null), lightbox = ref(null)
const photoIndex = ref(2), photoMode = ref('actual'), videoIndex = ref(0), videoPlaying = ref(false), menuOpen = ref(false)
const photo = computed(() => land.photos[photoIndex.value])
const video = computed(() => land.videos[videoIndex.value])
const photoCaption = computed(() => photoMode.value === 'actual' ? 'Estado actual · Color realzado' : 'Terreno despejado · Concepto visual')
const features = [
  { number: '01', title: 'Agua propia', text: 'Pozo de agua propio con bomba de extracción incluida.' },
  { number: '02', title: 'Frente sobre calle principal', text: '149 metros de frente y acceso directo desde la calle principal.' },
  { number: '03', title: 'Una nueva perspectiva', text: 'Terreno elevado con vista panorámica y relación abierta con el entorno.' },
  { number: '04', title: 'Perímetro definido', text: 'Terreno lotificado en Colonia El Cortijo para explorar tu próximo proyecto.' },
]
function movePhoto(step) { photoIndex.value = (photoIndex.value + step + land.photos.length) % land.photos.length }
function moveVideo(step) { videoPlaying.value = false; videoIndex.value = (videoIndex.value + step + land.videos.length) % land.videos.length }
async function goTo(id) {
  menuOpen.value = false
  const scroll = await content.value.$el.getScrollElement()
  const target = root.value.$el.querySelector(`#${id}`)
  if (!target) return
  const top = target.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop - 100
  scroll.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
function navigateSection(event) {
  const link = event.target.closest('a[href^="#"]')
  if (!link || event.defaultPrevented) return
  event.preventDefault(); goTo(link.hash.slice(1))
}
function backToCollection() { router.push({ name: 'oc', query: { section: 'propiedades' } }) }
function closeLightbox(event) {
  if (event.target !== lightbox.value) return
  const rect = lightbox.value.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.value.close()
}
function lightboxKeys(event) {
  if (event.key === 'ArrowRight') { event.preventDefault(); movePhoto(1) }
  if (event.key === 'ArrowLeft') { event.preventDefault(); movePhoto(-1) }
}
onIonViewDidEnter(() => { heroActive.value = true })
onIonViewWillLeave(() => { heroActive.value = false; videoPlaying.value = false; menuOpen.value = false; lightbox.value?.close() })
</script>

<template>
  <IonPage ref="root" class="oc-land-page" @click="navigateSection">
    <IonContent ref="content" :fullscreen="true">
      <header slot="fixed" class="land-header">
        <a href="/oc" class="land-logo" aria-label="OC Grupo Inmobiliario" @click.prevent="router.push('/oc')"><img src="/oc-recorrido/assets/oc-logo.svg" alt="OC Grupo Inmobiliario"></a>
        <nav :class="{ open: menuOpen }" aria-label="Información del terreno"><a href="#land-details">El terreno</a><a href="#land-gallery">Galería</a><a href="#land-videos">Videos</a><a href="#land-location">Ubicación</a></nav>
        <a class="button header-cta" href="#land-contact">Agendar visita <span>↗</span></a>
        <button class="land-menu" :aria-expanded="menuOpen" aria-label="Menú del terreno" @click="menuOpen = !menuOpen">☰</button>
      </header>
      <main>
        <OcLandHero :active="heroActive" @back="backToCollection" />
        <div class="land-stats container" aria-label="Datos principales del terreno">
          <div><strong>9,911.56 <small>m²</small></strong><span>Área total del terreno</span></div><div><strong>149 <small>m</small></strong><span>Frente sobre calle principal</span></div><div><strong>Pozo propio</strong><span>Con bomba de extracción</span></div><div><strong>1 <small>min</small></strong><span>Del Centro Comercial Vidú*</span></div>
        </div>
        <section id="land-details" class="details-section section-pad">
          <div class="container">
            <div class="section-heading"><div><p class="eyebrow">01 / EL TERRENO</p><h2>Un terreno.<br>Muchas posibilidades.</h2></div><p class="section-intro">9,911.56 m² en Colonia El Cortijo, con acceso sobre calle principal, pozo de agua propio y un entorno conectado con el sur de Guatemala.</p></div>
            <div class="feature-grid"><article v-for="feature in features" :key="feature.number"><span class="feature-number">{{ feature.number }}</span><h3>{{ feature.title }}</h3><p>{{ feature.text }}</p></article></div>
            <div class="possibilities"><p class="eyebrow">ESPACIO PARA TU VISIÓN</p><div class="possibility-grid"><article><h3>Proyecto habitacional</h3><p>Explora una propuesta residencial en una zona consolidada, con servicios cercanos.</p></article><article><h3>Centro logístico</h3><p>Un frente amplio y conexiones hacia la VAS, Costa Sur y Carretera a El Salvador.</p></article><article><h3>Inversión a futuro</h3><p>Una propiedad en el corredor entre Villa Nueva, Villa Canales y la Costa Sur.</p></article></div></div>
          </div>
        </section>
        <section id="land-gallery" class="gallery-section section-pad">
          <div class="container"><div class="section-heading"><div><p class="eyebrow">02 / PERSPECTIVAS</p><h2>Conoce cada ángulo.</h2></div><p class="section-intro">Seis miradas para explorar la escala del terreno, sus accesos y su relación con el entorno.</p></div>
            <div class="gallery-toolbar"><div class="mode-switch" role="group" aria-label="Vista del terreno"><button :aria-pressed="photoMode === 'actual'" @click="photoMode = 'actual'">Estado actual</button><button :aria-pressed="photoMode === 'cleared'" @click="photoMode = 'cleared'">Terreno despejado</button></div><span class="photo-counter">{{ String(photoIndex + 1).padStart(2, '0') }} / 06</span></div>
            <button class="gallery-photo" aria-label="Ampliar fotografía del terreno" @click="lightbox.showModal()"><img :src="photo[photoMode]" :alt="`${photo.label} · ${photoCaption}`" loading="lazy"><span class="expand-label">Ampliar ↗</span><span class="concept-badge" v-if="photoMode === 'cleared'">CONCEPTO VISUAL</span></button>
            <div class="gallery-caption"><div><h3>{{ photo.label }}</h3><p>{{ photoCaption }}</p></div><div class="arrows"><button aria-label="Fotografía anterior" @click="movePhoto(-1)">←</button><button aria-label="Fotografía siguiente" @click="movePhoto(1)">→</button></div></div>
            <div class="photo-thumbs"><button v-for="(item, index) in land.photos" :key="item.label" :aria-label="item.label" :aria-pressed="photoIndex === index" @click="photoIndex = index"><img :src="item[photoMode]" alt="" loading="lazy"><span>{{ String(index + 1).padStart(2, '0') }}</span></button></div>
          </div>
        </section>
        <section id="land-videos" class="video-section section-pad"><div class="container"><div class="section-heading"><div><p class="eyebrow">03 / EN MOVIMIENTO</p><h2>El Cortijo,<br>en primera persona.</h2></div><p class="section-intro">Grabaciones aéreas del terreno y sus alrededores. Recorre las siete perspectivas disponibles.</p></div>
          <div class="video-frame"><iframe v-if="videoPlaying" :key="video.id" :src="`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`" :title="video.label" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe><button v-else class="video-cover" aria-label="Reproducir video del terreno" @click="videoPlaying = true"><img :src="land.photos[videoIndex % land.photos.length].actual" alt="Vista del terreno"><span class="play-circle">▷</span><span class="video-play-label">Ver recorrido en video</span></button></div>
          <div class="gallery-caption"><div><h3>{{ video.label }}</h3><p>{{ videoIndex + 1 }} / {{ land.videos.length }} · Recorridos aéreos</p></div><div class="arrows"><button aria-label="Video anterior" @click="moveVideo(-1)">←</button><button aria-label="Video siguiente" @click="moveVideo(1)">→</button></div></div>
          <a class="plain-link" :href="`https://www.youtube.com/watch?v=${video.id}`" target="_blank" rel="noopener noreferrer">Abrir este video en YouTube ↗</a>
        </div></section>
        <section id="land-location" class="location-section section-pad">
          <div class="container">
            <div class="section-heading"><div><p class="eyebrow">04 / EL ENTORNO</p><h2>Conectado con<br>lo que importa.</h2></div><p class="section-intro">Colonia El Cortijo, Villa Nueva. Conexiones hacia Villa Canales, la VAS, Costa Sur y Carretera a El Salvador.</p></div>
            <div class="location-grid">
              <div class="nearby">
                <article><strong>1 <small>min*</small></strong><div><h3>Centro Comercial Vidú</h3><p>Bancos, restaurantes, gimnasio, tiendas de conveniencia y supermercados.</p></div></article>
                <article><strong>4 <small>min*</small></strong><div><h3>C.C. Metrocentro</h3><p>Y otros importantes centros comerciales de Villa Nueva.</p></div></article>
                <article><strong>5 <small>min*</small></strong><div><h3>Mercado Nuevo de Villa Nueva</h3><p>Abasto y comercio local de la zona sur.</p></div></article>
                <ul class="location-access" aria-label="Accesos y conexiones"><li>Acceso a la <b>VAS</b></li><li>Salida a <b>Costa Sur</b></li><li>Carretera a <b>El Salvador</b></li><li>Ingreso / salida <b>Villa Canales</b></li><li>Conexión <b>Villa Nueva</b></li></ul>
                <p class="reference-note">*Tiempos de referencia indicados en la ficha del terreno; pueden variar según el tráfico y la ruta.</p>
              </div>
              <div class="location-map">
                <iframe :src="land.mapsEmbedUrl" title="Ubicación del terreno El Cortijo en Google Maps" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
                <div class="location-reference"><p><strong>Referencia plus code:</strong> {{ land.plusCode }}</p><a :href="land.mapsUrl" target="_blank" rel="noopener noreferrer">Abrir en Google Maps <span>↗</span></a></div>
              </div>
            </div>
          </div>
        </section>
        <section id="land-contact" class="contact-section section-pad"><div class="container contact-grid"><div><p class="eyebrow">TU PRÓXIMO PROYECTO</p><h2>Comencemos<br>una conversación.</h2><p>Solicita el plano, conoce los accesos y coordina una visita al terreno con Grupo OC.</p></div><div class="contact-options"><a v-for="person in land.contacts" :key="person.number" :href="landWhatsApp(person.number)" target="_blank" rel="noopener noreferrer"><span><small>WHATSAPP</small><strong>{{ person.label }}</strong></span><b>↗</b></a><p>Elige cualquiera de los dos números para solicitar información o agendar tu visita.</p></div></div></section>
        <footer class="land-footer container">
          <img src="/oc-recorrido/assets/oc-logo.svg" alt="OC Grupo Inmobiliario">
          <div class="footer-brand-copy"><p>Tu próxima inversión, nuestra prioridad.</p><span>Colonia El Cortijo · Villa Nueva, Guatemala</span></div>
          <button @click="backToCollection">Volver a propiedades ↑</button>
          <nav class="footer-socials" aria-label="Redes sociales de Grupo OC">
            <p>Conoce más de Grupo OC</p>
            <div class="social-links">
              <a href="https://www.youtube.com/@GrupoOC_Inmobiliaria" target="_blank" rel="noopener noreferrer">YouTube <span aria-hidden="true">↗</span></a>
              <a href="https://www.instagram.com/ocinmobiliariaoficial?dlrf=Zmp6Y2F0c3l1cGF5" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
              <a href="https://www.facebook.com/share/1HrYeYyZsU/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">Facebook <span aria-hidden="true">↗</span></a>
              <a href="https://www.tiktok.com/@grupo.inmobiliario.oc?_r=1&amp;_t=ZP-9B71WqZyq47" target="_blank" rel="noopener noreferrer">TikTok <span aria-hidden="true">↗</span></a>
            </div>
          </nav>
        </footer>
      </main>
      <dialog ref="lightbox" class="land-lightbox" @click="closeLightbox" @keydown="lightboxKeys" aria-label="Galería ampliada del terreno"><button class="close-lightbox" aria-label="Cerrar fotografía" @click="lightbox.close()">×</button><img :src="photo[photoMode]" :alt="photo.label"><div class="lightbox-bar"><button aria-label="Anterior ampliada" @click="movePhoto(-1)">←</button><span>{{ photoIndex + 1 }} / 6 · {{ photoCaption }}</span><button aria-label="Siguiente ampliada" @click="movePhoto(1)">→</button></div></dialog>
    </IonContent>
  </IonPage>
</template>

<style scoped src="../theme/oc-land.css"></style>
