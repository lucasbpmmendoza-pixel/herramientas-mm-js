# Guia de Deployment - Vercel y Netlify

## Deployment Vercel

### Opcion 1: CLI Local

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Autenticarse con Vercel
vercel login

# 3. Deploy
vercel
```

### Opcion 2: GitHub + Vercel Dashboard (Recomendado)

#### Paso 1: Preparar Repositorio Git
```bash
# Inicializar git si no existe
git init
git add .
git commit -m "Initial commit: herramientas-mm"

# Crear repositorio en GitHub
# https://github.com/new
# Y luego:
git remote add origin https://github.com/tuusuario/herramientas-mm.git
git branch -M main
git push -u origin main
```

#### Paso 2: Conectar en Vercel Dashboard
1. Ir a [https://vercel.com](https://vercel.com)
2. Login con tu cuenta (o crear nueva)
3. Click en "New Project"
4. Importar tu repositorio de GitHub
5. Seleccionar repositorio `herramientas-mm`
6. Framework: Next.js
7. Deploy!

#### Paso 3: Configurar Variables de Entorno

En Vercel Dashboard:
1. Project Settings > Environment Variables
2. Añadir variables:

```
DATABASE_URL = "Server=tcp:xxxxx.database.windows.net,1433;..."
NEXTAUTH_URL = "https://tuapp.vercel.app"
NEXTAUTH_SECRET = "xxx"
JWT_SECRET = "xxx"
```

#### Paso 4: Deploy Automatico

Cada push a `main` se desplegara automaticamente:

```bash
git push origin main
# Vercel construye y despliega automaticamente
```

---

## Deployment Netlify

### Opcion 1: CLI Local

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Autenticarse
netlify login

# 3. Deploy
netlify deploy
```

### Opcion 2: GitHub + Netlify Dashboard (Recomendado)

#### Paso 1: Preparar Repositorio
(Mismo que Vercel)

#### Paso 2: Conectar en Netlify Dashboard
1. Ir a [https://app.netlify.com](https://app.netlify.com)
2. Login con tu cuenta
3. Click en "Add new site" > "Import an existing project"
4. Seleccionar GitHub
5. Autorizar Netlify en GitHub
6. Seleccionar repositorio
7. Deploy!

#### Paso 3: Configurar Variables de Entorno

En Netlify Dashboard:
1. Site Settings > Build & Deploy > Environment
2. Añadir variables:

```
DATABASE_URL = "Server=tcp:xxxxx.database.windows.net,1433;..."
NEXTAUTH_URL = "https://tuapp.netlify.app"
NEXTAUTH_SECRET = "xxx"
JWT_SECRET = "xxx"
```

#### Paso 4: Configurar Build Settings
- Build command: `npm run build`
- Publish directory: `.next`

---

## Generacion de Secrets

### Generar NEXTAUTH_SECRET y JWT_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Ejecutar dos veces y copiar ambos valores para:
- `NEXTAUTH_SECRET`
- `JWT_SECRET`

---

## Migrar Base de Datos en Produccion

### Desde Local

```bash
# 1. Asegurar variables de entorno locales
# Verificar .env.local con DATABASE_URL de produccion

# 2. Ejecutar migraciones
npm run db:migrate

# 3. Seed (si necesario)
npm run db:seed
```

### Desde GitHub Actions

Crear workflow para automatizar migraciones:

```yaml
# .github/workflows/migrate.yml
name: Migrate Database

on:
  workflow_dispatch:  # Manual trigger
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18.x
      - run: npm ci
      - run: npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Custom Domain

### Vercel

1. Project Settings > Domains
2. Click "Add Domain"
3. Ingresa tu dominio (ej: admin.tuempresa.com)
4. Seguir instrucciones DNS

### Netlify

1. Site Settings > Domain Management
2. Click "Add custom domain"
3. Ingresa tu dominio
4. Seguir instrucciones DNS

---

## SSL/HTTPS

- ✅ Vercel: Automatico (Let's Encrypt)
- ✅ Netlify: Automatico (Let's Encrypt)

---

## Monitoreo y Logs

### Vercel
- Dashboard > Deployments
- Click en deployment para ver logs
- Monitorar en real-time durante build

### Netlify
- Site overview
- Deploys para historial
- Logs disponibles en cada deploy

---

## Troubleshooting

### Error: Build failed

```
Check logs for:
- npm install issues → verificar dependencias
- Env vars missing → revisar en dashboard
- Type errors → npm run type-check
- Database issues → verificar DATABASE_URL
```

### Website not loading

```
Check:
- Health endpoint: /api/health
- Database connection: npm run db:migrate
- Environment variables estan configuradas
- Firewall Azure SQL permite IPs de proveedor
```

### Deployments lentos

```
Optimizar:
- Reducir tamaño de dependencias
- Usar edge functions para logica simple
- Cache optimizado
- Lazy loading de componentes
```

---

## Rollback

### Vercel
1. Dashboard > Deployments
2. Seleccionar deployment anterior
3. Click en menu > "Promote to Production"

### Netlify
1. Deploys > Deploy anterior
2. Click en "Deploy details"
3. "Publish deploy"

---

## Performance Tips

1. **Images**: Usar Next.js Image component
2. **Code Splitting**: Automatic con Next.js
3. **Caching**: Configurar headers
4. **Database**: Usar connection pooling
5. **API**: Cachear respuestas cuando sea posible

---

## Proximos Pasos

1. ✅ Push a GitHub
2. ✅ Conectar a Vercel/Netlify
3. ✅ Configurar variables de entorno
4. ✅ Ejecutar migraciones
5. ✅ Probar en staging URL
6. ✅ Custom domain (opcional)
7. ✅ Monitoreo y alertas
