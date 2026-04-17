# Configuración Azure SQL Database

## Paso 1: Crear Azure SQL Database

### Desde Azure Portal

1. Ir a [portal.azure.com](https://portal.azure.com)
2. Click en "Crear un recurso"
3. Buscar "SQL Database"
4. Hacer click en "Crear"

### Configuración Básica

- **Nombre de la BD**: `herramientas-mm`
- **Suscripción**: Seleccionar tu suscripción
- **Grupo de recursos**: Crear uno nuevo o seleccionar existente
- **Servidor**: Crear nuevo servidor SQL
  - **Nombre del servidor**: `tu-servidor-mm` (único globalmente)
  - **Ubicación**: Seleccionar región cercana
  - **Autenticación**: SQL Server authentication
  - **Admin login**: `mmadmin`
  - **Contraseña**: Contraseña fuerte (mínimo 8 caracteres, con mayúsculas, números, símbolos)

### Configuración Adicional

- **Proceso de datos**: Basic
- **Almacenamiento**: 5 GB
- **Redundancia de copia de seguridad**: Localmente redundante

### Firewall y Conexión

1. Después de crear, ir a "Firewall and virtual networks"
2. Añadir regla de firewall:
   - **Nombre**: `AllowLocal` o `AllowYourIP`
   - **IP inicial**: Tu dirección IP
   - **IP final**: Tu dirección IP
3. Para Azure services: Activar "Allow Azure services and resources to access this server"

## Paso 2: Obtener Cadena de Conexión

1. En el servidor SQL, ir a "Settings" > "Connection strings"
2. Copiar la conexión para SQL Server (ADO.NET):

```
Server=tcp:xxx.database.windows.net,1433;Initial Catalog=xxx;Persist Security Info=False;User ID=xxx;Password={your_password};Encrypt=True;Connection Timeout=30;Authentication=Active Directory Default;
```

Reemplazar:
- `your_server` con tu nombre de servidor
- `your_database` con `herramientas-mm`
- `your_username` con `mmadmin`
- `your_password` con tu contraseña

## Paso 3: Configurar en .env.local

Copia la conexión a `.env.local`:

```env
DATABASE_URL="Server=tcp:tu-servidor-mm.database.windows.net,1433;Initial Catalog=herramientas-mm;Persist Security Info=False;User ID=mmadmin;Password=tuContraseña;Encrypt=True;Connection Timeout=30;Authentication=Active Directory Default;"
```

## Paso 4: Acceso Seguro

### Autenticación Azure AD Recomendada

1. En Azure Portal, ir a tu servidor SQL
2. Set Azure AD admin:
   - Click en "Azure Active Directory"
   - Click en "Set admin"
   - Seleccionar usuario o grupo
   - Click en "Select"

3. Actualizar `DATABASE_URL`:

```env
DATABASE_URL="Server=tcp:tu-servidor-mm.database.windows.net,1433;Initial Catalog=herramientas-mm;Authentication=Active Directory Default;"
```

### Restricciones de IP

1. Whitelist solo IPs necesarias
2. Para Vercel/Netlify, agregar rangos de IPs:
   - Vercel: https://vercel.com/docs/concepts/edge-network/region-list
   - Netlify: Consultar soporte

## Troubleshooting

### Error: "Cannot open database 'xxx'"
- Verificar que el nombre de la base de datos es correcto
- Asegurar de ejecutar migraciones: `npm run db:migrate`

### Error: "Login failed for user 'xxx'"
- Verificar credenciales en DATABASE_URL
- Asegurar que usuario existe en servidor SQL

### Error: "Firewall rules"
- Agregar IP en firewall del servidor
- Para aplicaciones cloud, activar "Azure services"

### Error: "Connection timeout"
- Verificar firewall de tu red
- Intentar conexión desde máquina local primero
- Revisar logs de Azure Portal

## Monitoreo y Escalabilidad

### Performance Insights
1. Azure Portal > SQL Database > Performance Insights
2. Monitorear queries lentas
3. Optimizar índices si es necesario

### Escalabilidad
- Cambiar DTU (performance tier) según demanda
- De Basic (5 DTU) a Standard/Premium según necesario
- Revisar costos antes de cambios

## Copias de Seguridad

Automáticas:
- 7 días de retención (Basic)
- Configurar en "Backup retention"

Manuales:
```bash
# Exportar a BACPAC
az sql db export --resource-group mygroup --server myserver \
  --name mydb --admin-user mmadmin --admin-password password \
  --storage-key-type StorageAccessKey --storage-key key \
  --storage-uri https://xxx.blob.core.windows.net/bacpacs/mydb.bacpac
```

## Referencias

- [Documentación Azure SQL](https://learn.microsoft.com/es-es/azure/azure-sql/)
- [Prisma Azure SQL](https://www.prisma.io/docs/concepts/database-connectors/sql-server)
- [Connection Strings](https://learn.microsoft.com/es-es/dotnet/framework/data/adonet/connection-string-syntax)
