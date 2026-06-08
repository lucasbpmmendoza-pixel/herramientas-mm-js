# Herramientas MM - Panel Administrativo

Panel Administrativo de Colaboradores - Version JavaScript/Next.js con Azure SQL

## Caracteristicas

- ✅ Autenticacion por NIP
- ✅ Gestion de Colaboradores
- ✅ Estadisticas y Reportes
- ✅ Gestion de Permisos y Vacaciones
- ✅ Interfaz Responsiva (Tailwind CSS)
- ✅ Base de datos Azure SQL
- ✅ Deployable en Vercel/Netlify

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Azure SQL Database
- Cuenta de Vercel o Netlify (para deployment)

## Instalacion Local

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd herramientas-mm-js
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Azure SQL:

```env
DATABASE_URL="Server=tcp:YOUR_SERVER.database.windows.net,1433;Initial Catalog=YOUR_DATABASE;Persist Security Info=False;User ID=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=True;Connection Timeout=30;Authentication=Active Directory Default;"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
JWT_SECRET="your-jwt-secret-key"
```

### 3. Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run generate:prisma

# Ejecutar migraciones
npm run db:migrate

# Seed inicial (usuarios de prueba)
npm run db:seed
```

### 4. Ejecutar Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

**Credenciales Demo:**
- NIP: `0001` (Admin)
- Contraseña: `admin123`

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Autenticacion
│   │   ├── users/        # Gestion de usuarios
│   │   └── estadisticas/ # Estadisticas
│   ├── auth/             # Paginas de autenticacion
│   ├── dashboard/        # Dashboard principal
│   ├── layout.tsx        # Layout global
│   └── page.tsx          # Pagina de inicio
├── components/           # Componentes React
├── lib/                  # Utilidades y helpers
│   ├── auth.ts          # Autenticacion JWT
│   └── api-client.ts    # Cliente HTTP
├── types/               # Tipos TypeScript
└── styles/              # Estilos CSS
```

## Deployment

### Netlify

#### Opcion 1: CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
```

#### Opcion 2: GitHub

1. Push a GitHub
2. Conecta repositorio en [Netlify Dashboard](https://app.netlify.com)
3. Configura variables de entorno en Netlify
4. Deploy automatico en cada push

**netlify.toml:**
```toml
[build]
command = "npm run build"
functions = "dist/functions"
```

### Vercel

#### Opcion 1: CLI

```bash
npm install -g vercel
vercel login
vercel
```

#### Opcion 2: GitHub

1. Push a GitHub
2. Importa en [Vercel Dashboard](https://vercel.com/import)
3. Configura Environment Variables
4. Deploy automatico en cada push

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "env": ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"]
}
```

### GitHub Actions (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run db:migrate
```

## Variables de Entorno Requeridas

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexion Azure SQL | `Server=tcp:...` |
| `NEXTAUTH_URL` | URL de la app | `https://tuapp.vercel.app` |
| `NEXTAUTH_SECRET` | Secret NextAuth | `openssl rand -base64 32` |
| `JWT_SECRET` | Secret JWT | Contraseña aleatoria |

## API Endpoints

### Autenticacion
- `POST /api/auth/login` - Iniciar sesion con NIP

### Usuarios
- `GET /api/users` - Listar colaboradores (solo admin)
- `GET /api/users/[id]` - Obtener detalles de usuario
- `PUT /api/users/[id]` - Actualizar usuario (solo admin)
- `DELETE /api/users/[id]` - Eliminar usuario (solo admin)

### Estadisticas
- `GET /api/estadisticas` - Obtener estadisticas
- `POST /api/estadisticas` - Crear estadistica (solo admin)
- `PUT /api/estadisticas/[id]` - Actualizar estadistica
- `DELETE /api/estadisticas/[id]` - Eliminar estadistica

## Troubleshooting

### Error: No User 'sa' in SQL Server
Asegurate que tu cadena de conexion Azure SQL sea correcta y que el usuario exista.

### Error: Cannot connect to database
- Verifica que la firewall de Azure SQL permite tu IP
- Comprueba que `DATABASE_URL` esta configurado
- Ejecuta `npm run generate:prisma`

### Error: Port 3000 already in use
```bash
npm run dev -- -p 3001
```

## Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto esta bajo licencia MIT.

## Soporte

Para soporte, contacta al equipo de desarrollo.
