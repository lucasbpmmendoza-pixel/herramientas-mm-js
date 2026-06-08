# Project Structure - Herramientas MM

Estructura completa del proyecto Next.js con TypeScript y Tailwind CSS.

## arbol de Directorios

```
herramientas-mm-js/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # CD/CI para Vercel
│       └── test.yml                # Tests automaticos
├── prisma/
│   ├── schema.prisma               # Esquema de BD (Prisma)
│   └── seed.js                     # Datos iniciales
├── src/
│   ├── app/
│   │   ├── api/                    # Rutas API (Next.js)
│   │   │   ├── auth/
│   │   │   │   └── login/
│   │   │   │       └── route.ts    # POST /api/auth/login
│   │   │   ├── users/
│   │   │   │   └── route.ts        # GET /api/users (admin)
│   │   │   ├── estadisticas/
│   │   │   │   └── route.ts        # GET/POST /api/estadisticas
│   │   │   ├── permisos/
│   │   │   │   └── route.ts        # GET/POST /api/permisos
│   │   │   └── vacaciones/
│   │   │       └── route.ts        # GET/POST /api/vacaciones
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── page.tsx        # Pagina login
│   │   ├── dashboard/
│   │   │   ├── colaboradores/      # (Futuro)
│   │   │   ├── estadisticas/       # (Futuro)
│   │   │   ├── permisos/           # (Futuro)
│   │   │   ├── vacaciones/         # (Futuro)
│   │   │   └── page.tsx            # Dashboard principal
│   │   ├── layout.tsx              # Layout raiz
│   │   └── page.tsx                # Pagina inicio
│   ├── components/
│   │   ├── LoginForm.tsx           # Formulario login
│   │   └── (otros componentes)     # Botones, Cards, etc.
│   ├── lib/
│   │   ├── auth.ts                 # JWT, tokens
│   │   ├── api-client.ts           # Cliente HTTP
│   │   └── (helpers)               # Utilidades
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── utils/
│   │   └── (funciones utiles)
│   ├── styles/
│   │   └── globals.css             # Estilos globales
│   └── middleware.ts               # Middleware de rutas
├── public/
│   └── (archivos estaticos)
├── .env.example                    # Variables de entorno (template)
├── .env.local                      # Variables de entorno (NO comitear)
├── .eslintrc.json                  # Reglas ESLint
├── .gitignore                      # Archivos ignorados
├── .prettierrc                     # Configuracion Prettier
├── .dockerignore                   # Archivos ignorados Docker
├── tailwind.config.js              # Configuracion Tailwind
├── tsconfig.json                   # Configuracion TypeScript
├── next.config.js                  # Configuracion Next.js
├── postcss.config.js               # Configuracion PostCSS
├── Dockerfile                      # Docker image
├── docker-compose.yml              # Orquestacion Docker
├── package.json                    # Dependencias npm
├── README.md                       # Documentacion principal
├── QUICK_START.md                  # Inicio rapido
├── DEPLOYMENT_GUIDE.md             # Guia deployment
├── AZURE_SQL_SETUP.md              # Setup Azure SQL
├── DOCKER_SETUP.md                 # Setup Docker
└── API_TESTING.md                  # Ejemplos API
```

## Explicacion por Carpeta

### `/src/app`
**Next.js App Router** - Todas las paginas y rutas API.
- Estructura de directorios = rutas de URL
- `page.tsx` = pagina renderizable
- `route.ts` = endpoint API

### `/src/components`
**Componentes React** reutilizables.
- Botones
- Formularios
- Cards
- Navbars
- Modales

### `/src/lib`
**Funciones utilitarias** compartidas.
- `auth.ts` - Manejo de JWT, tokens
- `api-client.ts` - Cliente HTTP con axios
- Helpers de validacion, formateo, etc.

### `/src/types`
**Interfaces TypeScript** compartidas.
- `User` - Estructura de usuario
- `Estadistica` - Estadisticas de colaboradores
- `ApiResponse` - Respuesta estandar API

### `/prisma`
**ORM Prisma** - Base de datos.
- `schema.prisma` - Definicion de tablas y relaciones
- `seed.js` - Script para datos iniciales

### `/.github/workflows`
**GitHub Actions** - CI/CD automatico.
- Tests en cada PR
- Deploy en push a main

### `/public`
**Archivos estaticos** (imagenes, fonts, etc).

---

## Convenciones de Codigo

### Nombres de Archivos

```
✅ Correcto
- Componentes: PascalCase (LoginForm.tsx)
- Hooks: camelCase (useUser.ts)
- Utils: camelCase (formatDate.ts)
- Tipos: PascalCase (User.ts)
- Paginas: lowercase (page.tsx)
- Rutas API: route.ts

❌ Evitar
- kebab-case para componentes
- UPPER_CASE para archivos
```

### Estructura de Componentes

```tsx
// LoginForm.tsx - Componente bien estructurado
"use client"; // Si necesita interactividad

import { useState } from "react";
import type { LoginFormProps } from "@/types"; // Tipos

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  
  // Logica aqui
  
  return (
    <form>
      {/* JSX */}
    </form>
  );
}
```

### API Routes

```ts
// /api/usuarios/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticacion
    const token = getTokenFromHeader(request.headers.get("authorization"));
    if (!verifyToken(token || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Logica aqui
    
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  // Similar a GET
}
```

---

## Flujo de Datos

```
Pagina (page.tsx)
    ↓
  Componente (LoginForm.tsx)
    ↓
  API Client (lib/api-client.ts)
    ↓
  API Route (/api/auth/login/route.ts)
    ↓
  Prisma ORM
    ↓
  Azure SQL Database
```

---

## Importaciones

### Rutas Relativas (evitar)
```tsx
import { Button } from "../../../components/Button";
```

### Path Aliases (recomendado)
```tsx
import { Button } from "@/components/Button";
import type { User } from "@/types";
import { generateToken } from "@/lib/auth";
```

Configurado en `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/types/*": ["./src/types/*"]
  }
}
```

---

## Agregar Nueva Funcionalidad

### 1. Crear modelo en Prisma

```prisma
// prisma/schema.prisma
model MiModelo {
  id    String   @id @default(cuid())
  name  String
  ...
}
```

### 2. Migrar BD

```bash
npx prisma migrate dev --name add_mi_modelo
```

### 3. Crear API Route

```ts
// src/app/api/mi-modelo/route.ts
export async function GET(request: NextRequest) {
  // Implementar
}
```

### 4. Crear componente

```tsx
// src/components/MiModelo.tsx
export function MiModelo() {
  // Implementar
}
```

### 5. Crear pagina

```tsx
// src/app/dashboard/mi-modulo/page.tsx
import { MiModelo } from "@/components/MiModelo";

export default function MiModuloPage() {
  return <MiModelo />;
}
```

---

## Tests (Futuro)

```
__tests__/
├── unit/
│   ├── lib/
│   ├── utils/
│   └── types/
├── integration/
│   └── api/
└── e2e/
    └── auth.spec.ts
```

---

## Documentacion

Cada carpeta puede tener su `README.md`:

```
src/
├── components/README.md    # Como usar componentes
├── lib/README.md           # Helpers disponibles
├── app/api/README.md       # Documentacion API
```

---

## Mantenibilidad

✅ Reglas:
- 1 responsabilidad por archivo
- Maximo 300 lineas por archivo
- TypeScript strict mode
- Comentar logica compleja
- Nombres descriptivos

❌ Evitar:
- Archivos de 1000+ lineas
- "Logica magica" sin comentarios
- Codigo duplicado
- Imports circulares

---

¡Estructura lista para escalar! 🚀
