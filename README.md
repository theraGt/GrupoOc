# Grupo OC

Proyecto independiente en Ionic Vue. Todo el código y los recursos necesarios están dentro de esta carpeta.

## Desarrollo

```sh
npm ci
npm run dev
```

Abrir http://127.0.0.1:5174. Node.js 20.19+ o 22.12+.

## Producción y pruebas

```sh
npm run build
npm run preview
npm run test:e2e
```

La compilación queda en dist/. Las pruebas usan Microsoft Edge y un puerto exclusivo (5194). El hosting debe devolver index.html para las rutas de la aplicación.

Incluye el recorrido OC, sus propiedades, filtros y la ficha del terreno de Villa Nueva con fotos, videos y contactos. / abre /oc; la ficha está en /oc/propiedades/terreno-villa-nueva. Conserva la versión estática de referencia en /oc-recorrido/index.html.
