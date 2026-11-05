<script setup>
import { computed } from 'vue'
const props = defineProps({ crop: { type: Array, required: true } })
const viewBox = computed(() => props.crop.join(' '))
</script>
<template>
  <span class="property-image">
    <svg :viewBox="viewBox" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <image href="/oc-recorrido/assets/recorrido-original.png" width="1024" height="1536" />
    </svg>
  </span>
</template>
<style scoped>
.property-image{display:block;position:relative;aspect-ratio:1.65!important;overflow:hidden}
svg{position:absolute;inset:0;width:100%;height:100%;display:block}
@media(max-width:600px){.property-image{aspect-ratio:1.4!important}}
</style>
