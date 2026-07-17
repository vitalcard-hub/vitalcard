# VitalCard 🩺

App instalable (PWA) que guarda tu ficha médica de emergencia — alergias, condiciones,
medicamentos, contacto de emergencia — **solo en tu celular**, y la muestra a cualquier
médico del mundo con pictogramas universales + texto en 8 idiomas, sin depender de
que tú o el médico hablen el mismo idioma.

## Cómo funciona (modelo de privacidad)

- **No hay base de datos ni servidor guardando tus datos médicos.** Todo vive en el
  `localStorage` del navegador/celular donde instalas la app. Nadie más puede verlo,
  ni siquiera tú si cambias de teléfono sin hacer respaldo manual.
- El "servidor gratuito" que vas a usar (ver abajo) **solo sirve los archivos de la
  app** (HTML/CSS/JS), igual que cualquier página web. No procesa ni almacena tu
  información personal — eso nunca sale de tu dispositivo.
- Para mostrarle tus datos a un médico tienes dos formas: (1) abrir la app y tocar
  "Modo médico" — pantalla completa, alto contraste, en 8 idiomas a la vez — o
  (2) mostrar el código QR, que codifica lo esencial (tipo de sangre, alergias,
  medicamentos, contacto) y se puede leer con cualquier lector QR **sin internet**.

## Desplegar gratis (elige una — ambas son 100% gratuitas)

### Opción A: GitHub Pages (recomendada, la más simple de mantener)
1. Crea una cuenta gratuita en [github.com](https://github.com) si no tienes una.
2. Crea un repositorio nuevo, por ejemplo `vitalcard`.
3. Sube TODOS los archivos de esta carpeta (`index.html`, `style.css`, `app.js`,
   `dictionary.js`, `manifest.json`, `service-worker.js`, la carpeta `icons/`) a
   la raíz del repositorio.
4. Ve a **Settings → Pages**, en "Source" elige la rama `main` y carpeta `/root`.
   Guarda.
5. En 1–2 minutos tu app estará en `https://tu-usuario.github.io/vitalcard/`.
6. Ábrela desde el celular con ese link → el navegador ofrecerá "Instalar app" o
   "Agregar a pantalla de inicio".

### Opción B: Netlify
1. Crea cuenta gratis en [netlify.com](https://netlify.com).
2. Arrastra esta carpeta completa a la zona de "Deploy manually" en el dashboard.
3. Netlify te da un link público al instante (puedes personalizar el subdominio).

## Cómo actualizar la app después

Cuando quieras agregar un idioma, corregir algo o añadir una función:
1. Edita los archivos localmente (o pídeme que lo haga).
2. **Importante**: sube el número de `CACHE_VERSION` en `service-worker.js`
   (por ejemplo de `'vitalcard-v1'` a `'vitalcard-v2'`). Esto le dice a los
   celulares de los usuarios que hay una versión nueva.
3. Vuelve a subir los archivos al mismo repositorio/hosting (sobrescribiendo).
4. La próxima vez que el usuario abra la app con internet, se actualiza sola en
   segundo plano — no necesita reinstalar nada.

## Estructura de archivos

```
index.html          → estructura de la app (pantallas: tarjeta, editar)
style.css            → todo el diseño visual
app.js                → lógica: guardar datos, tarjeta de emergencia, modo médico, QR
dictionary.js          → diccionario médico en 8 idiomas (editable/ampliable)
manifest.json            → hace que el navegador pueda "instalar" la app
service-worker.js         → funcionamiento offline + auto-actualización
icons/                      → íconos de la app
```

## Ampliar el diccionario de idiomas o términos médicos

Todo el texto multilenguaje vive en `dictionary.js`. Para agregar un idioma nuevo,
agrégalo al arreglo `LANGS` y añade su traducción en cada objeto (`UI`,
`ALLERGY_DICT`, `CONDITION_DICT`, `BIRTH_CONDITION_DICT`). Para agregar una alergia,
condición o enfermedad de nacimiento que no está en la lista, añade una entrada
nueva siguiendo el mismo patrón que las existentes.

## Limitación honesta a tener en cuenta

Esto **no reemplaza una identificación médica oficial ni el consejo de un
profesional**; es una ayuda de comunicación en emergencia. Si viajas, te
recomiendo también llevar una copia impresa (puedes hacer captura de pantalla del
"Modo médico" o del QR) por si el celular se queda sin batería o se daña.
