-- =====================================================================
-- UPEC Libro Fest 2026 — esquema de base de datos (PostgreSQL / Neon)
--
-- Ejecutar una sola vez contra la base de Neon, antes del primer despliegue:
--
--     psql "$DATABASE_URL" -f db/esquema.sql
--
-- o pegándolo en el editor SQL de la consola de Neon.
--
-- Las cuatro primeras tablas son las que Better Auth espera, con los nombres de
-- columna exactos que genera su adaptador de Kysely (camelCase, por eso van
-- entrecomilladas: PostgreSQL las plegaría a minúsculas sin las comillas).
-- Las dos últimas son nuestras.
-- =====================================================================

-- ------------------------------------------------------------- usuarios ----
-- «user» es palabra reservada en PostgreSQL: siempre entre comillas.
create table if not exists "user" (
  "id"            text primary key,
  "name"          text not null,
  "email"         text not null unique,
  "emailVerified" boolean not null default false,
  "image"         text,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);

-- -------------------------------------------------------------- sesiones ----
-- Sesiones de inicio de sesión, no sesiones del festival. La colisión de nombre
-- es desafortunada pero es el esquema de Better Auth; nuestras actividades viven
-- en «sesion_guardada».
create table if not exists "session" (
  "id"        text primary key,
  "expiresAt" timestamptz not null,
  "token"     text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId"    text not null references "user" ("id") on delete cascade
);

create index if not exists "session_userId_idx" on "session" ("userId");
create index if not exists "session_token_idx"  on "session" ("token");

-- --------------------------------------------------------------- cuentas ----
-- Una fila por proveedor enlazado. Aquí viven el access token y el refresh token
-- de Google, que es lo que permite escribir en el calendario más tarde sin volver
-- a mandar a nadie a la pantalla de consentimiento.
create table if not exists "account" (
  "id"                    text primary key,
  "accountId"             text not null,
  "providerId"            text not null,
  "userId"                text not null references "user" ("id") on delete cascade,
  "accessToken"           text,
  "refreshToken"          text,
  "idToken"               text,
  "accessTokenExpiresAt"  timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope"                 text,
  "password"              text,
  "createdAt"             timestamptz not null default now(),
  "updatedAt"             timestamptz not null
);

create index if not exists "account_userId_idx" on "account" ("userId");
create unique index if not exists "account_provider_uq"
  on "account" ("providerId", "accountId");

-- ---------------------------------------------------------- verificación ----
create table if not exists "verification" (
  "id"         text primary key,
  "identifier" text not null,
  "value"      text not null,
  "expiresAt"  timestamptz not null,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);

create index if not exists "verification_identifier_idx"
  on "verification" ("identifier");

-- =====================================================================
-- Tablas propias del festival
-- =====================================================================

-- ------------------------------------------------------ agenda personal ----
-- Una fila por actividad guardada. La clave única «(userId, sesionId)» hace que
-- guardar dos veces sea inofensivo, que es justo lo que necesita una cola de
-- escrituras que puede reintentar tras quedarse sin red.
--
-- «eventoGoogleId» guarda el id del evento creado en Google Calendar, y es lo que
-- permite borrarlo si alguien quita la actividad de su agenda o apaga la
-- sincronización. Sin esto, apagar el interruptor dejaría basura en el calendario
-- real de una persona.
create table if not exists "sesion_guardada" (
  "id"             text primary key,
  "userId"         text not null references "user" ("id") on delete cascade,
  "sesionId"       text not null,
  "dia"            text not null,
  "eventoGoogleId" text,
  "createdAt"      timestamptz not null default now(),
  constraint "sesion_guardada_uq" unique ("userId", "sesionId")
);

create index if not exists "sesion_guardada_userId_idx"
  on "sesion_guardada" ("userId");

-- -------------------------------------------------------- preferencias ----
-- Ahora mismo solo el interruptor de calendario. Tabla aparte y no columnas en
-- «user» porque Better Auth es dueño de esa tabla y conviene no pisarla.
create table if not exists "preferencia_usuario" (
  "userId"         text primary key references "user" ("id") on delete cascade,
  "syncCalendario" boolean not null default false,
  "updatedAt"      timestamptz not null default now()
);
