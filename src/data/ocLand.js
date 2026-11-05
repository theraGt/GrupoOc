// Content and embedded photographs supplied in terreno-villa-nueva.html.
const assetRoot = '/oc-recorrido/assets/terreno-villa-nueva'
export const land = {
  name: 'El Cortijo', location: 'Villa Nueva, Guatemala', area: '9,911.56', frontage: '149',
  mapsUrl: 'https://www.google.com/maps?q=14.500054890872207,-90.57174869986984',
  mapsEmbedUrl: 'https://www.google.com/maps?q=14.500054890872207,-90.57174869986984&z=16&output=embed',
  plusCode: 'GC2H+28C Villa Nueva',
  photos: ['Vista cenital · Norte', 'Vista cenital · Sur', 'Vista panorámica', 'Perspectiva lateral', 'Vista del acceso', 'Frente del terreno'].map((label, index) => ({ label, actual: `${assetRoot}/actual-${index + 1}.webp`, cleared: `${assetRoot}/cleared-${index + 1}.webp` })),
  videos: [
    { id: 'bOfYyESV2pM', label: 'Recorrido aéreo con drone' },
    { id: 'HLx2hR2Iu9c', label: 'Recorrido general del terreno' },
    { id: '9R9PMGv5io4', label: 'Vista panorámica del terreno' },
    { id: 'hWPSh7n5Xck', label: 'Vista 360° del terreno' },
    { id: 'TK92VIgnSXw', label: 'Primer plano del terreno' },
    { id: 'c-8Bl-tWN9Q', label: 'Vista desde lejos' },
    { id: 'vQOA7dtjC0A', label: 'Amenidades y comercios cercanos' },
  ],
  contacts: [{ number: '50242390413', label: '+502 4239 0413' }, { number: '50253684955', label: '+502 5368 4955' }],
}
export function landWhatsApp(number) {
  return `https://wa.me/${number}?text=${encodeURIComponent('Hola, me interesa el terreno de 9,911.56 m² en Villa Nueva. Quisiera información, solicitar el plano y agendar una visita.')}`
}
