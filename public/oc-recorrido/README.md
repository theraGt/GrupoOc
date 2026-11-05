# OC Grupo Inmobiliario — recorrido continuo

Página independiente HTML/CSS/JS. Abrir index.html o servir la carpeta. Dentro de Vite usar /oc-recorrido/index.html.

## Diseño

Identidad oficial: Metropolis Medium / Regular / Light, azul noche #00000E, azul profundo #00294C, arena #DCAB76, marfil #F1EEE6 y azul acento #286D89. Logo vectorial extraído del PDF de marca, con su geometría original y fondo transparente. Fuentes locales de https://github.com/dw5/Metropolis; licencia en assets/fonts/UNLICENSE.

## Continuidad

assets/edificio-continuo-oc.png es una única imagen vertical generada con image_gen a partir de las vistas aprobadas, consolidando los pisos en una sola arquitectura coherente. La cámara usa escalado uniforme constante y una única traslación vertical reversible. No hay sustituciones de imagen, fundidos, cambios de encuadre por sección ni deformaciones. La iluminación es consistente a lo largo del edificio; no se simula un ciclo día/noche con imágenes distintas.

Es una simulación 2.5D sobre una imagen, no geometría 3D ni video generado con Monid/Higgsfield. scroll-world aporta el control de cámara suavizado por scroll, permanencia, reproducción y accesibilidad. Los servicios de video no estaban disponibles y no se usaron créditos de video. El panorama reconciliado conserva el estilo de los mockups, pero no constituye documentación arquitectónica exacta.

La versión móvil encuadra el mismo panorama con interfaz adaptada y menú desplegable. Autoplay de 65 segundos, pausa e interrupción al usar rueda/tacto/teclado. Movimiento reducido desactiva reproducción y suavizado. Galería conceptual con filtros y diálogo; el formulario descarga una consulta local, no envía datos.

## Arte

- edificio-continuo-oc.png: panorama definitivo, herramienta integrada image_gen; prompt en PROMPT-panorama.txt.
- architecture-clean.png: estudio intermedio de fondos sin interfaz, ya no usado por la cámara.
- recorrido-original.png: storyboard aprobado, conservado para las imágenes conceptuales de la galería.
- oc-logo.svg: vector original del PDF, página 5, recortado mediante viewBox y sin el rectángulo de fondo de la página.

## Comprobaciones

npx playwright test --config playwright.oc.config.js

Prueba navegación, reproducción/pausa, filtros, consulta descargable, menú móvil, movimiento reducido y ausencia de desbordamiento. Una prueba adicional cruza los tres límites entre capítulos en ambos sentidos, verifica escala constante y desplazamiento continuo sin saltos.
