-- Control-Gastos: schema inicial (autenticación + dashboard + módulos futuros)
-- Ejecutar contra la base de datos control_gastos

-- =========================================================
-- USUARIOS (autenticación)
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    role           VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Evita duplicados de correo sin importar mayúsculas/minúsculas
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));

-- =========================================================
-- ACTIVOS (ingresos / bienes)
-- =========================================================
CREATE TABLE IF NOT EXISTS activos (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre         VARCHAR(200) NOT NULL,
    monto          NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
    categoria      VARCHAR(100) NOT NULL DEFAULT 'General',
    descripcion    TEXT,
    fecha          DATE         NOT NULL DEFAULT CURRENT_DATE,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activos_user_id_idx ON activos (user_id);
CREATE INDEX IF NOT EXISTS activos_user_fecha_idx ON activos (user_id, fecha);

-- =========================================================
-- PASIVOS (deudas / créditos)
-- =========================================================
CREATE TABLE IF NOT EXISTS pasivos (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre          VARCHAR(200) NOT NULL,
    monto           NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
    tasa_interes    NUMERIC(5,2) DEFAULT 0,
    categoria       VARCHAR(100) NOT NULL DEFAULT 'General',
    fecha_vencimiento DATE,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'PAGADO', 'VENCIDO')),
    descripcion     TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pasivos_user_id_idx ON pasivos (user_id);
CREATE INDEX IF NOT EXISTS pasivos_user_estado_idx ON pasivos (user_id, estado);

-- =========================================================
-- PENDIENTES (pagos próximos / facturas por vencer)
-- =========================================================
CREATE TABLE IF NOT EXISTS pendientes (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre          VARCHAR(200) NOT NULL,
    monto           NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
    fecha_vencimiento DATE         NOT NULL,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PAGADO', 'VENCIDO')),
    descripcion     TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pendientes_user_id_idx ON pendientes (user_id);
CREATE INDEX IF NOT EXISTS pendientes_user_fecha_idx ON pendientes (user_id, fecha_vencimiento);

-- =========================================================
-- SUSCRIPCIONES (cobros recurrentes)
-- =========================================================
CREATE TABLE IF NOT EXISTS suscripciones (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre          VARCHAR(200) NOT NULL,
    monto           NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
    ciclo_cobro     VARCHAR(30)  NOT NULL DEFAULT 'MENSUAL' CHECK (ciclo_cobro IN ('SEMANAL', 'QUINCENAL', 'MENSUAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL')),
    proxima_renovacion DATE       NOT NULL,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'PAUSADA', 'CANCELADA')),
    descripcion     TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS suscripciones_user_id_idx ON suscripciones (user_id);
CREATE INDEX IF NOT EXISTS suscripciones_user_estado_idx ON suscripciones (user_id, estado);

-- =========================================================
-- MOVIMIENTOS (registro de ingresos y egresos del mes)
-- =========================================================
CREATE TABLE IF NOT EXISTS movimientos (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo            VARCHAR(10)  NOT NULL CHECK (tipo IN ('INGRESO', 'GASTO')),
    monto           NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    categoria       VARCHAR(100) NOT NULL DEFAULT 'General',
    descripcion     TEXT,
    fecha           DATE         NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS movimientos_user_id_idx ON movimientos (user_id);
CREATE INDEX IF NOT EXISTS movimientos_user_fecha_idx ON movimientos (user_id, fecha);
CREATE INDEX IF NOT EXISTS movimientos_user_tipo_fecha_idx ON movimientos (user_id, tipo, fecha);
