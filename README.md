# Control-Gastos — Etapa 1: Login multiusuario

Proyecto funcional con **login + registro + PostgreSQL + JWT + pantalla de mantenimiento + logout**, siguiendo la arquitectura:

```
Angular → API REST → Node.js/TypeScript → PostgreSQL
```

Estructura del backend respetada (`modules/expense` queda vacía y preparada para después):

```
backend/src/
├── config/database.ts
├── middlewares/auth.middleware.ts
├── modules/
│   ├── auth/
│   │   ├── controllers/auth.controller.ts
│   │   ├── services/auth.service.ts
│   │   ├── models/user.model.ts, user.repository.ts
│   │   └── routes/auth.routes.ts
│   └── expense/        ← vacía, intacta, para futuras etapas
├── seed/seed-users.ts
├── app.ts
└── server.ts
```

---

## 1. Requisitos previos

- Node.js 18+ (recomendado 20)
- PostgreSQL 14+ corriendo localmente
- npm (o pnpm, si lo prefieres)

---

## 2. Configurar PostgreSQL

Crea la base de datos:

```bash
psql -U postgres -c "CREATE DATABASE control_gastos;"
```

Aplica el esquema (crea la tabla `users`):

```bash
psql -U postgres -d control_gastos -f backend/sql/schema.sql
```

---

## 3. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env` con tus credenciales reales de PostgreSQL y un `JWT_SECRET` propio.

Crear usuarios de prueba (hasheados con bcrypt, insertados en PostgreSQL):

```bash
npm run seed
```

Esto crea:

| Nombre | Email             | Password    | Rol   |
|--------|-------------------|-------------|-------|
| Diego  | diego@email.com   | Diego123!   | ADMIN |
| Juan   | juan@email.com    | Juan123!    | USER  |
| Maria  | maria@email.com   | Maria123!   | USER  |

Levantar el backend:

```bash
npm run dev
```

Debe mostrar:

```
[database] PostgreSQL connection OK
Control-Gastos backend running on port 3000
```

---

## 4. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm start
```

Abre `http://localhost:4200`. Debe cargar la pantalla de login (fondo gris/azul marino, letras blancas).

---

## 5. Probar el sistema

### Registro de un nuevo usuario
1. En el login, presiona **Registrarse**.
2. Completa nombre, correo y contraseña (mínimo 6 caracteres).
3. Al crear la cuenta, el usuario queda insertado en PostgreSQL con contraseña hasheada y te redirige al login.

### Login válido
- Usa cualquiera de los usuarios sembrados (ej. `diego@email.com` / `Diego123!`) o el que acabas de registrar.
- Debe llevarte a `/maintenance`, mostrando a Luigi saludando, el texto "Estamos trabajando en el control de gastos..." y "Vuelva pronto."

### Casos de prueba obligatorios

| # | Caso | Resultado esperado |
|---|------|---------------------|
| 1 | Usuario válido | Login exitoso → `/maintenance` |
| 2 | Contraseña incorrecta | 401, mensaje de error, no navega |
| 3 | Usuario inexistente | 401, mensaje de error |
| 4 | Usuario desactivado (`status = 'INACTIVE'` en BD) | 403, mensaje de error |
| 5 | Campos vacíos | Validación en el formulario, no se envía |
| 6 | Múltiples usuarios | Diego y Juan pueden autenticarse por separado |
| 7 | Logout | `/login → /maintenance → Cerrar sesión → /login` |
| 8 | Ruta protegida | Entrar a `/maintenance` sin sesión redirige a `/login` |
| 9 | Base de datos | `SELECT * FROM users;` muestra los usuarios creados |
| 10 | Seguridad | `password_hash` en PostgreSQL nunca es texto plano |

Para probar el caso 4, puedes desactivar un usuario manualmente:

```sql
UPDATE users SET status = 'INACTIVE' WHERE email = 'juan@email.com';
```

Para probar el caso 8: cierra sesión, luego intenta entrar directamente a `http://localhost:4200/maintenance` — debe redirigir a `/login`. El guard de Angular también bloquea el regreso con el botón "Atrás" del navegador, porque revalida la sesión en cada navegación.

---

## 6. Endpoints disponibles

| Método | Ruta            | Descripción                          | Protegido |
|--------|-----------------|---------------------------------------|-----------|
| POST   | `/auth/register`| Crea un usuario nuevo                 | No        |
| POST   | `/auth/login`   | Autentica y devuelve JWT + usuario    | No        |
| GET    | `/auth/me`      | Devuelve el usuario del token actual  | Sí (Bearer)|
| GET    | `/health`       | Chequeo de salud del servidor         | No        |

---

## 7. Notas importantes

- Las contraseñas nunca se guardan en texto plano: se hashean con `bcryptjs` (10 salt rounds) antes de insertarse en PostgreSQL.
- La autenticación consulta PostgreSQL de verdad — no hay usuarios "hardcodeados" en el código.
- El correo es único (constraint `UNIQUE` + índice case-insensitive), así que no se pueden registrar dos cuentas con el mismo correo.
- `modules/expense/` se dejó intacta y vacía a propósito — ahí irá el siguiente módulo cuando lo indiques.
- No se implementó todavía dashboard, gastos, ingresos, ni ningún otro módulo financiero: el alcance de esta etapa es exclusivamente autenticación.

Cuando quieras continuar con el siguiente módulo (gastos, ingresos, etc.), dímelo y seguimos sobre esta misma base.
