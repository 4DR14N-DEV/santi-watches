# SantiWatches

Tienda web de relojes de alta gama. Sitio de una sola página con
panel de administrador integrado: el público ve el catálogo, el
administrador (un único usuario) puede agregar relojes y marcarlos
como agotados sin borrarlos.

Instagram de referencia: [@santiwatchesco](https://www.instagram.com/santiwatchesco/)

---

## Arquitectura

```
santiwatches/
├── backend/          → API en Node.js + Express, patrón MVC
│   ├── config/        → conexión a la base de datos y seed del admin
│   ├── models/        → acceso a datos (SQLite vía node:sqlite)
│   ├── controllers/    → lógica de negocio
│   ├── routes/         → definición de endpoints
│   ├── middleware/     → autenticación (JWT) y subida de imágenes (Multer)
│   ├── uploads/         → fotos de los relojes subidas por el admin
│   ├── database/        → archivo .sqlite (se crea solo, no va en git)
│   └── server.js
│
└── frontend/         → HTML + CSS + JavaScript (vanilla, CommonJS no aplica aquí
                         porque el frontend corre en el navegador, no en Node)
    ├── css/            → reset, variables (design tokens), componentes, responsive
    ├── js/             → api.js, ui.js, animations.js (GSAP), auth.js, watches.js, main.js
    ├── vendor/gsap/    → GSAP servido localmente (sin depender de un CDN externo)
    └── index.html
```

### Por qué `node:sqlite` en vez de `better-sqlite3`

El proyecto usa el módulo **nativo** `node:sqlite` (disponible desde
Node 22.5+) en vez de paquetes como `better-sqlite3` o `sqlite3`.
Esos paquetes traen bindings en C++ que hay que compilar con
`node-gyp` al instalar — lo cual falla si la máquina no tiene
herramientas de compilación (build-essential, python, etc.), algo
muy común en WSL recién instalado. `node:sqlite` viene incluido en
Node: `npm install` es instantáneo y no depende de nada externo.

Vas a ver una advertencia como esta al arrancar el servidor:

```
(node:XXXX) ExperimentalWarning: SQLite is an experimental feature and might change at any time
```

Es normal, no es un error. El módulo funciona de forma estable para
un proyecto de este tamaño.

---

## Requisitos

- **Node.js 22.5 o superior** (por `node:sqlite`). Verifica tu versión:
  ```bash
  node --version
  ```
  Si tienes una versión menor, instala Node 22 LTS (por ejemplo con
  `nvm install 22`).

---

## Instalación y arranque

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Abre `.env` y define tus propias credenciales de administrador antes
de arrancar por primera vez:

```
PORT=3000
JWT_SECRET=cambia_este_secreto_por_uno_largo_y_aleatorio
NODE_ENV=development
ADMIN_USERNAME=tu_usuario
ADMIN_PASSWORD=tu_password_segura
```

`ADMIN_USERNAME` y `ADMIN_PASSWORD` solo se usan **una vez**, la
primera vez que arranca el servidor y la base de datos está vacía:
en ese momento se crea el único usuario administrador con esas
credenciales (contraseña ya cifrada con bcrypt). Si cambias esas
variables después, no va a crear un segundo usuario ni a actualizar
la contraseña — para eso tendrías que borrar `backend/database/` y
dejar que se regenere desde cero.

Arranca el servidor:

```bash
npm start
```

Deberías ver:

```
SantiWatches backend corriendo en http://localhost:3000
```

El backend **también sirve el frontend** (no necesitas un servidor
aparte para el HTML/CSS/JS): abre `http://localhost:3000` en tu
navegador y ya está.

### 2. Modo desarrollo (con recarga automática)

```bash
npm run dev
```

Usa `nodemon`, reinicia el servidor cada vez que guardas un cambio
en el backend. (Los cambios de frontend no necesitan reiniciar nada,
solo refrescar el navegador).

---

## Flujo de uso

- **Visitante público**: entra a `http://localhost:3000`, ve el
  catálogo de relojes. No puede editar nada.
- **Administrador**: hace clic en "Ingresar" (arriba a la derecha),
  entra con las credenciales de `.env`. Al iniciar sesión aparece:
  - Un botón flotante dorado (+) abajo a la derecha, para agregar
    un nuevo reloj.
  - Un botón "Marcar agotado" / "Marcar disponible" debajo de cada
    reloj existente.
- **Marcar como agotado** no borra el reloj ni lo saca del catálogo:
  solo le pone una cinta diagonal "AGOTADO" y reduce la opacidad de
  toda la card. El producto sigue estando ahí, visible, para que el
  público sepa que existió/existe la pieza.
- **El precio es opcional**: si el admin no lo llena al crear el
  reloj, la card pública muestra "Disponible bajo consulta" en vez
  de un precio.

---

## Endpoints de la API

| Método | Ruta                                  | Auth  | Descripción                             |
|--------|----------------------------------------|-------|------------------------------------------|
| POST   | `/api/auth/login`                     | No    | Inicia sesión, entrega cookie httpOnly    |
| POST   | `/api/auth/logout`                    | No    | Cierra sesión                             |
| GET    | `/api/auth/me`                        | Sí    | Devuelve el usuario autenticado           |
| GET    | `/api/watches`                        | No    | Lista todos los relojes                   |
| GET    | `/api/watches/:id`                    | No    | Detalle de un reloj                       |
| POST   | `/api/watches`                        | Sí    | Crea un reloj (multipart/form-data)       |
| PATCH  | `/api/watches/:id/toggle-sold-out`    | Sí    | Alterna el estado agotado/disponible      |
| DELETE | `/api/watches/:id`                    | Sí    | Elimina un reloj definitivamente          |

Las rutas marcadas "Sí" requieren la cookie de sesión (JWT), que el
navegador envía automáticamente después de hacer login desde la
misma página.

---

## Notas de diseño

- **Mobile-first**: todo el CSS se escribe primero pensando en
  pantallas pequeñas; los ajustes de tablet/escritorio están en
  `css/responsive.css` con `min-width`.
- **Paleta**: carbón (`#0a0a09`) + dorado champán (`#c9a84c`) + hueso
  (`#e8e1d3`), buscando transmitir prestigio sin caer en un dorado
  "bling".
- **Tipografía**: Cormorant Garamond (títulos, serif elegante),
  Inter (cuerpo de texto), JetBrains Mono (precios y datos técnicos).
- **Animaciones GSAP**: preloader con manecilla que gira, entrada
  escalonada del hero, revelado de cards al hacer scroll
  (ScrollTrigger), pulso de confirmación al cambiar el estado de un
  reloj.
- GSAP se sirve desde `frontend/vendor/gsap/` (archivos locales, no
  un CDN externo), para que el sitio no dependa de terceros.

---

## Seguridad

- Las contraseñas se guardan con hash `bcrypt`, nunca en texto plano.
- La sesión se maneja con JWT en una cookie **httpOnly** (no en
  `localStorage`), lo que reduce el riesgo de robo del token vía XSS.
- Los nombres y descripciones de los relojes se escapan antes de
  insertarse en el DOM, para evitar inyección de HTML.
- El único usuario administrador se crea desde variables de entorno,
  nunca hay un formulario público de registro.
