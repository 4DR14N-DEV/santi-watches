<div align="center">

# SantiWatches

**Relojería de alta gama — Medellín, Colombia**

[![Node.js](https://img.shields.io/badge/Node.js-22.5+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-node:sqlite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-88CE02?style=flat-square&logo=greensock&logoColor=white)](https://gsap.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[![Deploy Frontend](https://img.shields.io/badge/Deploy-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://santi-watches.vercel.app)
[![Deploy Backend](https://img.shields.io/badge/Deploy-Backend-000000?style=for-the-badge&logo=render&logoColor=white)](https://santi-watches.onrender.com)

---

E-commerce de relojes de lujo con panel de administrador integrado.
El público ve el catálogo; el administrador gestiona piezas, precios y disponibilidad.

**[Ver sitio en vivo →](https://santi-watches.vercel.app)**

</div>

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML, CSS, JavaScript (ES Modules), Vite |
| Backend | Node.js, Express, JWT, Multer |
| Base de datos | SQLite (node:sqlite) |
| Animaciones | GSAP + ScrollTrigger |
| Deploy | Vercel (frontend) + Render (backend) |
| Storage | Cloudinary (vídeos hero) |

## Funcionalidades

- **Catálogo público** — Grid de relojes con imágenes, nombre, descripción y precio
- **Panel de administrador** — CRUD completo de piezas
- **Marcar agotado** — Oculta visualmente sin borrar el producto
- **Vídeo hero** — Fondo con crossfade entre dos vídeos de Cloudinary
- **Animaciones GSAP** — Preloader, reveal de cards, parallax, efecto glow
- **Diseño responsive** — Mobile-first, 1-4 columnas según breakpoint
- **Seguridad** — bcrypt, JWT httpOnly, rate limiting, CORS whitelist

## Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env   # Editar credenciales
npm start              # http://localhost:3000

# Desarrollo (hot reload)
npm run dev
```

## Arquitectura

```
santiwatches/
├── backend/
│   ├── config/        → DB connection + admin seed
│   ├── models/        → SQLite data access
│   ├── controllers/   → Business logic
│   ├── routes/        → API endpoints
│   ├── middleware/     → JWT auth + Multer uploads
│   └── server.js      → Express app
│
└── frontend/
    ├── css/           → Design tokens, components, responsive
    ├── js/            → ES modules (api, auth, animations, watches)
    ├── assets/fonts/  → DelicateElegance
    └── index.html
```

## API Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Login, retorna cookie httpOnly |
| POST | `/api/auth/logout` | — |Cierra sesión |
| GET | `/api/auth/me` | ✓ | Usuario autenticado |
| GET | `/api/watches` | — | Listar relojes |
| GET | `/api/watches/:id` | — | Detalle de reloj |
| POST | `/api/watches` | ✓ | Crear reloj (multipart) |
| PATCH | `/api/watches/:id/toggle-sold-out` | ✓ | Alternar disponibilidad |
| DELETE | `/api/watches/:id` | ✓ | Eliminar reloj |

## Environment Variables

```env
PORT=3000
JWT_SECRET=secreto_largo_y_aleatorio
NODE_ENV=development
ADMIN_USERNAME=tu_usuario
ADMIN_PASSWORD=tu_password
CORS_ORIGIN=http://localhost:5173
```

## Tests

```bash
cd backend
npm test              # 40 tests (Jest + supertest)
```

## Licencia

MIT © [4DR14N-DEV](https://github.com/4DR14N-DEV)
