# Docker Setup - Herramientas MM

Ejecuta toda la aplicación con Docker Compose sin necesidad de instalar SQL Server localmente.

## Requisitos

- Docker Desktop instalado
- 4GB RAM disponible

## Inicio Rápido

### 1. Iniciar servicios

```bash
docker-compose up -d
```

### 2. Esperar a que SQL Server esté listo (30-60 segundos)

```bash
docker-compose logs -f sqlserver
```

Cuando veas "Server is ready to accept connection requests", continúa.

### 3. Inicializar base de datos

```bash
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

### 4. Acceder a la app

Abre http://localhost:3000

**Credenciales:**
- NIP: `0001`
- Contraseña: `admin123`

---

## Comandos Útiles

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo app
docker-compose logs -f app

# Solo SQL Server
docker-compose logs -f sqlserver
```

### Ejecutar comandos en la app

```bash
# Prisma Studio
docker-compose exec app npx prisma studio

# Build
docker-compose exec app npm run build

# Type check
docker-compose exec app npm run type-check
```

### Acceder a SQL Server

```bash
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost \
  -U sa \
  -P "YourPassword123!"
```

### Detener servicios

```bash
docker-compose down
```

### Limpiar todo (datos de BD)

```bash
docker-compose down -v
```

---

## Troubleshooting

### ❌ "Cannot connect to database"

```bash
# Ver si SQL Server está corriendo
docker-compose ps

# Ver logs de SQL Server
docker-compose logs sqlserver

# Reiniciar
docker-compose restart sqlserver
docker-compose exec app npm run db:migrate
```

### ❌ "Port 3000 already in use"

Cambiar en `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Cambiar de 3000 a 3001
```

### ❌ "Cannot find module"

```bash
docker-compose exec app npm install
```

### ❌ Build muy lento

Agregar a `.dockerignore` más archivos innecesarios.

---

## Desarrollo con Docker

### Actualizar dependencias

```bash
docker-compose exec app npm install
```

### Hacer migraciones

```bash
docker-compose exec app npm run db:migrate
```

### Ver BD visual

```bash
docker-compose exec app npx prisma studio
```

Abre http://localhost:5555

---

## Build para Producción

### Crear imagen

```bash
docker build -t herramientas-mm:latest .
```

### Correr en producción

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  herramientas-mm:latest
```

---

## Deploy en Cloud

### Azure Container Registry

```bash
# Login
az acr login --name myregistry

# Build y push
docker build -t myregistry.azurecr.io/herramientas-mm:latest .
docker push myregistry.azurecr.io/herramientas-mm:latest
```

### AWS ECR

```bash
# Login
aws ecr get-login-password | docker login --username AWS ...

# Build y push
docker build -t xxx.dkr.ecr.us-east-1.amazonaws.com/herramientas-mm:latest .
docker push xxx.dkr.ecr.us-east-1.amazonaws.com/herramientas-mm:latest
```

---

## Performance

- **Imagen tamaño**: ~500MB
- **Tiempo build**: ~3-5 minutos
- **Inicio app**: ~15 segundos
- **RAM requerida**: 512MB (app) + 1.5GB (SQL Server) = 2GB

---

## Notas

- SQL Server en Docker usa Express Edition (gratis)
- Almacenamiento en Docker es local (pierdes datos al `docker-compose down -v`)
- Para producción, usar Azure SQL Database o servidor dedicado
- Cambiar contraseña SQL Server en `docker-compose.yml` (NO usar "YourPassword123!")

¡Listo! 🐳
