# Control-Gastos

Sistema web para el control de ingresos, gastos y balance personal. Arquitectura:

```
Angular (frontend) → API REST → Node.js/TypeScript (backend) → PostgreSQL
```

---

## Tecnologias utilizadas

| Tecnologia | Version | Para que sirve |
|---|---|---|
| **Git** | 2.x+ | Control de versiones del codigo fuente. El repositorio se aloja en GitHub. |
| **GitHub** | - | Repositorio remoto donde se almacena el codigo: `https://github.com/dgiron-2025071/ControlGastos` |
| **Node.js** | 22.x | Runtime de JavaScript en el servidor. Ejecuta el backend. |
| **TypeScript** | 5.5 | Superset de JavaScript con tipado estatico. Se usa en frontend y backend. |
| **pnpm** | 9.x | Gestor de paquetes (alternativa rapida a npm). Se usa para instalar dependencias. |
| **Angular** | 18.2 | Framework de frontend SPA (Single Page Application). Maneja rutas, componentes y datos reactivos. |
| **RxJS** | 7.8 | Libreria de programacion reactiva. Angular la usa internamente y el proyecto la usa para comunicar componentes en tiempo real. |
| **Express** | 4.19 | Framework de servidor HTTP en Node.js. Sirve la API REST. |
| **PostgreSQL** | 14+ | Base de datos relacional donde se almacenan usuarios, ingresos y movimientos. |
| **bcryptjs** | 2.4 | Libreria para hashear contraseñas (nunca se guardan en texto plano). |
| **jsonwebtoken (JWT)** | 9.x | Tokens de autenticacion stateless. El backend los firma; el frontend los almacena y renueva. |
| **WebGL** | - | API del navegador para renderizar graficos 3D. Se usa para el fondo animado de las pantallas. |

---

## Estructura del proyecto

```
Control-Gastos/
├── backend/                          # API REST (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/database.ts        # Conexion a PostgreSQL (Pool)
│   │   ├── middlewares/auth.middleware.ts  # Verifica JWT en cada peticion protegida
│   │   ├── modules/
│   │   │   ├── auth/                 # Login, registro, refresh de JWT
│   │   │   │   ├── controllers/auth.controller.ts
│   │   │   │   ├── services/auth.service.ts
│   │   │   │   ├── models/user.model.ts, user.repository.ts
│   │   │   │   └── routes/auth.routes.ts
│   │   │   ├── activos/              # CRUD de ingresos
│   │   │   │   ├── controllers/activos.controller.ts
│   │   │   │   ├── services/activos.service.ts
│   │   │   │   ├── models/activo.model.ts   # 17 origenes permitidos
│   │   │   │   └── routes/activos.routes.ts
│   │   │   └── dashboard/            # Datos del dashboard y resumen completo
│   │   │       ├── controllers/dashboard.controller.ts
│   │   │       ├── services/dashboard.service.ts
│   │   │       └── routes/dashboard.routes.ts
│   │   ├── seed/seed-users.ts        # Crea usuarios de prueba
│   │   ├── app.ts                    # Montaje de Express y rutas
│   │   └── server.ts                 # Punto de entrada del servidor
│   ├── sql/schema.sql                # Esquema de la base de datos
│   ├── .env.example                  # Ejemplo de variables de entorno
│   └── package.json
│
├── frontend/                         # SPA (Angular 18 + TypeScript)
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── guards/               # authGuard, loginGuard (proteccion de rutas)
│   │   │   └── services/
│   │   │       ├── auth.service.ts           # Login, registro, refresh deslizante del token
│   │   │       ├── session.service.ts        # Sesion por inactividad (renovacion automatica)
│   │   │       ├── finance-store.service.ts  # Store compartido (mes/anio) en tiempo real
│   │   │       └── toast.service.ts
│   │   ├── features/
│   │   │   ├── login/                # Pantalla de login
│   │   │   ├── register/             # Pantalla de registro
│   │   │   ├── dashboard/            # Inicio con resumen y grafica
│   │   │   ├── activos/              # Gestion de ingresos (CRUD + filtros)
│   │   │   └── resumen/              # Resumen completo con grafica por anio
│   │   └── app.routes.ts             # Definicion de rutas SPA
│   └── package.json
│
└── README.md
```

---

## Requisitos previos

- **Node.js 22.x** — https://nodejs.org (descargar LTS)
- **pnpm 9.x** — una vez instalado Node, ejecutar en la terminal:
  ```bash
  npm install -g pnpm
  ```
- **PostgreSQL 14+** — https://www.postgresql.org/download/ (o usar Docker)
- **Git** — https://git-scm.com

---

## Paso a paso: clonar y ejecutar

### 1. Clonar el repositorio

Abrir **Git Bash** o la terminal del sistema:

```bash
git clone https://github.com/dgiron-2025071/ControlGastos.git
cd Control-Gastos
```

### 2. Cambiar a la rama con el codigo completo

```bash
git checkout dgiron-2025071
```

Toda la funcionalidad (login, activos, resumen, dashboard) esta en esta rama.

### 3. Configurar la base de datos

Abrir la terminal de PostgreSQL (`psql`) o usar un cliente como pgAdmin:

```sql
CREATE DATABASE control_gastos;
```

Luego aplicar el esquema:

```bash
psql -U postgres -d control_gastos -f backend/sql/schema.sql
```

### 4. Configurar el backend

Abrir la **terminal integrada de Visual Studio Code** (menú Terminal > New Terminal, o `Ctrl + º`):

```bash
cd backend
pnpm install
```

Copiar el archivo de ejemplo y editarlo con tus credenciales reales:

```bash
cp .env.example .env
```

Abrir `.env` y configurar:

```
DATABASE_USER=postgres
DATABASE_PASSWORD=(tu contraseña de PostgreSQL)
JWT_SECRET=(una frase larga y aleatoria)
JWT_EXPIRES_IN=2m
```

Crear usuarios de prueba (Diego, Juan, Maria):

```bash
pnpm run seed
```

Levantar el servidor:

```bash
pnpm run dev
```

Mensaje esperado:

```
[database] PostgreSQL connection OK
Control-Gastos backend running on port 3000
```

### 5. Configurar el frontend

Abrir una **segunda terminal** en Visual Studio Code (icono `+` en el panel de terminales):

```bash
cd frontend
pnpm install
pnpm start
```

Esperar a que aparezca:

```
Angular Live Development Server is listening on localhost:4200
```

### 6. Abrir la aplicacion

Abrir el navegador en:

```
http://localhost:4200
```

Debe cargar la pantalla de login. Usar:

| Email | Password |
|---|---|
| diego@email.com | Diego123! |
| juan@email.com | Juan123! |
| maria@email.com | Maria123! |

---

## Funcionalidades

### Login y registro
- Login con credenciales y JWT.
- Registro de nuevos usuarios (contraseña hasheada con bcrypt).
- La sesion expira por **inactividad** (no desde el login). Mientras el usuario interactue, el token se renueva automaticamente.

### Dashboard (Inicio)
- Resumen de ingresos del mes actual.
- Grafica de "Ingresos vs Gastos" de los ultimos 6 meses.
- Navegacion a Activos y Resumen Completo.

### Activos (Ingresos)
- CRUD completo de ingresos: crear, editar en linea, eliminar.
- 17 origenes de ingreso (Salario, Honorarios, Bonos, Comisiones, Dividendos, etc.).
- Filtros por texto, fecha, origen y rango de monto.
- Selector de mes/anio compartido con el resto de la aplicacion.

### Resumen Completo
- Grafica de barras por anio con los 12 meses.
- Selector directo de mes y anio.
- Totales de ingresos, gastos y balance del anio seleccionado.

### Sesion por inactividad
- El token JWT expira y se renueva automaticamente mientras el usuario interactue.
- Si el usuario no genera actividad en la ventana de tiempo configurada, la sesion se cierra y redirige al login con un mensaje informativo.

---

## Endpoints de la API

| Metodo | Ruta | Descripcion | Protegido |
|---|---|---|---|
| POST | `/auth/register` | Registrar usuario nuevo | No |
| POST | `/auth/login` | Login y devuelve JWT | No |
| POST | `/auth/refresh` | Renovar token (requiere token valido) | Si |
| GET | `/auth/me` | Usuario del token actual | Si |
| GET | `/api/activos?year=&month=` | Listar ingresos del mes | Si |
| GET | `/api/activos/origenes` | Lista de los 17 origenes | Si |
| POST | `/api/activos` | Crear ingreso | Si |
| PUT | `/api/activos/:id` | Actualizar ingreso | Si |
| DELETE | `/api/activos/:id` | Eliminar ingreso | Si |
| GET | `/api/dashboard?year=&month=` | Datos del dashboard | Si |
| GET | `/api/dashboard/resumen?year=&month=` | Resumen completo por anio | Si |
| GET | `/health` | Salud del servidor | No |

---

## Notas para desarrolladores

- Las contraseñas se hashean con **bcryptjs** (10 salt rounds) antes de insertarse en PostgreSQL.
- El correo es unico (constraint `UNIQUE` + indice).
- Los datos de la grafica del dashboard toman los ingresos de la tabla `activos` y los gastos de `movimientos` (tipo GASTO).
- El store `FinanceStoreService` es la fuente unica de verdad para el mes/anio seleccionado. Cualquier cambio se refleja en Inicio, Activos y Resumen de inmediato via un Observable (`refresh$`).
- El archivo `.env` **nunca** se sube al repositorio (esta en `.gitignore`). Solo se commitea `.env.example` con valores de ejemplo.
