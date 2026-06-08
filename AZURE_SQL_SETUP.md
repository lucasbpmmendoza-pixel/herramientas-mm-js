# Configuracion Azure SQL Database

## Paso 1: Crear Azure SQL Database

### Desde Azure Portal

1. Ir a [portal.azure.com](https://portal.azure.com)
2. Click en "Crear un recurso"
3. Buscar "SQL Database"
4. Hacer click en "Crear"

### Configuracion Basica

- **Nombre de la BD**: `herramientas-mm`
- **Suscripcion**: Seleccionar tu suscripcion
- **Grupo de recursos**: Crear uno nuevo o seleccionar existente
- **Servidor**: Crear nuevo servidor SQL
  - **Nombre del servidor**: `tu-servidor-mm` (unico globalmente)
  - **Ubicacion**: Seleccionar region cercana
  - **Autenticacion**: SQL Server authentication
  - **Admin login**: `mmadmin`
  - **Contraseña**: Contraseña fuerte (minimo 8 caracteres, con mayusculas, numeros, simbolos)

### Configuracion Adicional

- **Proceso de datos**: Basic
- **Almacenamiento**: 5 GB
- **Redundancia de copia de seguridad**: Localmente redundante

### Firewall y Conexion

1. Despues de crear, ir a "Firewall and virtual networks"
2. Añadir regla de firewall:
   - **Nombre**: `AllowLocal` o `AllowYourIP`
   - **IP inicial**: Tu direccion IP
   - **IP final**: Tu direccion IP
3. Para Azure services: Activar "Allow Azure services and resources to access this server"

## Paso 2: Obtener Cadena de Conexion

1. En el servidor SQL, ir a "Settings" > "Connection strings"
2. Copiar la conexion para SQL Server (ADO.NET):

```
Server=tcp:xxx.database.windows.net,1433;Initial Catalog=xxx;Persist Security Info=False;User ID=xxx;Password={your_password};Encrypt=True;Connection Timeout=30;Authentication=Active Directory Default;
```

Reemplazar:
- `your_server` con tu nombre de servidor
- `your_database` con `herramientas-mm`
- `your_username` con `mmadmin`
- `your_password` con tu contraseña

## Paso 3: Configurar en .env.local

Copia la conexion a `.env.local`:

```env
DATABASE_URL="Server=tcp:tu-servidor-mm.database.windows.net,1433;Initial Catalog=herramientas-mm;Persist Security Info=False;User ID=mmadmin;Password=tuContraseña;Encrypt=True;Connection Timeout=30;Authentication=Active Directory Default;"
```

## Paso 4: Acceso Seguro

### Autenticacion Azure AD Recomendada

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
- Intentar conexion desde maquina local primero
- Revisar logs de Azure Portal

## Monitoreo y Escalabilidad

### Performance Insights
1. Azure Portal > SQL Database > Performance Insights
2. Monitorear queries lentas
3. Optimizar indices si es necesario

### Escalabilidad
- Cambiar DTU (performance tier) segun demanda
- De Basic (5 DTU) a Standard/Premium segun necesario
- Revisar costos antes de cambios

## Copias de Seguridad

Automaticas:
- 7 dias de retencion (Basic)
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

- [Documentacion Azure SQL](https://learn.microsoft.com/es-es/azure/azure-sql/)
- [Prisma Azure SQL](https://www.prisma.io/docs/concepts/database-connectors/sql-server)
- [Connection Strings](https://learn.microsoft.com/es-es/dotnet/framework/data/adonet/connection-string-syntax)
