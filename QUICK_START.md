# Quick Start - Herramientas MM

Inicia el desarrollo en 5 minutos.

## Requisitos

- Node.js 18+
- npm o yarn
- Git
- Cuenta Azure (para BD en produccion)

## Instalacion Rapida

### 1️⃣ Clonar y Instalar

```bash
git clone <repository-url>
cd herramientas-mm-js
npm install
```

### 2️⃣ Configurar Base de Datos Local (SQL Server)

Si usas SQL Server local (opcional, puedes usar Azure):

```bash
# Instalar SQL Server 2022 o usar Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" \
  -p 1433:1433 \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### 3️⃣ Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
# Para Azure SQL
DATABASE_URL="Server=tcp:yourserver.database.windows.net,1433;Initial Catalog=herramientas-mm;User ID=sa;Password=YourPassword123;Encrypt=True;"

# O para local
DATABASE_URL="Server=localhost;Database=herramientas-mm;User Id=sa;Password=YourPassword123;Encrypt=true;Trust Server Certificate=true;"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
JWT_SECRET="your-jwt-secret"
```

### 4️⃣ Inicializar Base de Datos

```bash
# Generar Prisma Client
npm run generate:prisma

# Crear tablas en BD
npm run db:migrate

# Seed con datos de prueba
npm run db:seed
```

### 5️⃣ Iniciar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

**Credenciales Demo:**
```
NIP: 0001
Contraseña: admin123
```

---

## Estructura Rapida

```
src/
├── app/
│   ├── api/              ← Rutas API
│   ├── auth/             ← Paginas de login
│   ├── dashboard/        ← Panel principal
│   └── layout.tsx        ← Layout global
├── components/           ← Componentes React
├── lib/                  ← Helpers (auth, api)
└── types/                ← TypeScript interfaces
```

---

## Comandos utiles

```bash
# Desarrollo
npm run dev                # Inicia servidor dev

# Build & Deploy
npm run build             # Compila para produccion
npm start                 # Inicia servidor produccion

# Base de datos
npm run generate:prisma   # Genera Prisma Client
npm run db:migrate        # Ejecuta migraciones
npm run db:seed           # Carga datos iniciales

# Code Quality
npm run type-check        # Verifica tipos TypeScript
npm run lint              # Valida codigo
npm run format            # Formatea codigo
```

---

## Troubleshooting Rapido

### ❌ Error: "Cannot connect to database"

```bash
# 1. Verificar DATABASE_URL en .env.local
# 2. Verificar que SQL Server esta corriendo
# 3. Probar conexion:
npm run generate:prisma

# 4. Si aun falla, revisar firewall Azure SQL
```

### ❌ Error: "Port 3000 already in use"

```bash
npm run dev -- -p 3001
```

### ❌ Error: "Cannot find module 'prisma'"

```bash
npm install
npm run generate:prisma
```

### ❌ Login no funciona

```bash
# 1. Verificar seed ejecutado:
npm run db:seed

# 2. Verificar credenciales en seeder:
cat prisma/seed.js

# 3. Verificar BD tiene datos:
# Usar SQL Server Management Studio
```

---

## Proximo: Deployment

Una vez funcionando localmente:

### Opcion 1: Vercel (Recomendado)
1. `git push` tu codigo a GitHub
2. Import en https://vercel.com
3. Configurar env vars
4. Deploy! ✅

### Opcion 2: Netlify
1. `git push` tu codigo a GitHub
2. Conectar en https://netlify.com
3. Configurar env vars
4. Deploy! ✅

Lee [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para detalles.

---

## Proxima: Desarrollo

### Crear nueva pagina

```bash
# src/app/dashboard/colaboradores/page.tsx
touch src/app/dashboard/colaboradores/page.tsx
```

```tsx
export default function ColaboradoresPage() {
  return <div>Colaboradores</div>;
}
```

### Crear nueva ruta API

```bash
# src/app/api/health/route.ts
touch src/app/api/health/route.ts
```

```ts
export async function GET() {
  return Response.json({ status: "ok" });
}
```

### Crear componente reutilizable

```bash
# src/components/Button.tsx
touch src/components/Button.tsx
```

```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      {children}
    </button>
  );
}
```

---

## Tips Pro

1. **Usar Tailwind CSS** - Pre-instalado, clases en JSX
2. **TypeScript** - Verificar tipos: `npm run type-check`
3. **API Client** - Ya existe en `src/lib/api-client.ts`
4. **Auth** - Token guardado en localStorage
5. **Prisma Studio** - Ver BD: `npx prisma studio`

---

## Soporte Rapido

| Problema | Solucion |
|----------|----------|
| BD no conecta | Ver `DATABASE_URL` en `.env.local` |
| Build falla | `npm run type-check` para ver errores |
| Cambios no aparecen | Reiniciar: `npm run dev` |
| Seed no funciona | `npm run db:seed` nuevamente |

---

## Siguientes Pasos

- [ ] Seguir [README.md](./README.md) completo
- [ ] Crear cuenta Azure SQL
- [ ] Deploying a Vercel/Netlify
- [ ] Personalizar diseño con marca
- [ ] Agregar mas modulos
- [ ] Configurar CI/CD

¡Listo para desarrollar! 🚀
