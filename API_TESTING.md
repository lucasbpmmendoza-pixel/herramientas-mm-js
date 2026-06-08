# API Testing - Herramientas MM

Usar esta coleccion en Postman o similar para probar los endpoints.

## 1. Login

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "nip": "0001",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "admin",
      "nip": "0001",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "isAdmin": true,
      "isActive": true,
      "role": "ADMIN",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Guardar el token para proximas requests.

---

## 2. Obtener Usuarios (Admin)

```
GET http://localhost:3000/api/users?page=1&limit=10
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Parametros:**
- `page` (opcional): Numero de pagina (default: 1)
- `limit` (opcional): Cantidad por pagina (default: 10)

---

## 3. Obtener Estadisticas

```
GET http://localhost:3000/api/estadisticas?mes=1&año=2024
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Parametros:**
- `userId` (opcional): ID del usuario
- `mes` (opcional): Mes (1-12)
- `año` (opcional): Año (ej: 2024)

**Nota:** 
- Admin ve todas las estadisticas
- Usuarios regulares solo ven las suyas

---

## 4. Crear Estadistica (Admin)

```
POST http://localhost:3000/api/estadisticas
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "userId": "USER_ID",
  "metaTrabajo": 160,
  "horasTrabajadas": 152,
  "proyectos": 5,
  "tareasCompletas": 45,
  "tareasRetrasadas": 2,
  "calificacion": 4.5,
  "mes": 1,
  "año": 2024
}
```

---

## 5. Obtener Permisos

```
GET http://localhost:3000/api/permisos?estado=PENDIENTE
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Parametros:**
- `userId` (opcional): ID del usuario
- `estado` (opcional): PENDIENTE, APROBADO, RECHAZADO
- `page` (opcional): Numero de pagina
- `limit` (opcional): Cantidad por pagina

---

## 6. Crear Permiso

```
POST http://localhost:3000/api/permisos
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "userId": "USER_ID",
  "tipoPermiso": "REUNIoN",
  "fechaInicio": "2024-01-15T08:00:00Z",
  "fechaFin": "2024-01-15T09:00:00Z",
  "descripcion": "Reunion con cliente"
}
```

---

## 7. Obtener Vacaciones

```
GET http://localhost:3000/api/vacaciones?estado=PENDIENTE
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

---

## 8. Crear Solicitud de Vacaciones

```
POST http://localhost:3000/api/vacaciones
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "userId": "USER_ID",
  "fechaInicio": "2024-02-01T00:00:00Z",
  "fechaFin": "2024-02-15T23:59:59Z",
  "diasTotal": 10,
  "descripcion": "Vacaciones de verano"
}
```

---

## Errores Comunes

### 401 Unauthorized
- Token expirado o invalido
- Solucion: Hacer login nuevamente

### 403 Forbidden
- Usuario sin permisos para acceder recurso
- Solo admin puede acceder a ciertos endpoints

### 400 Bad Request
- Datos invalidos o incompletos
- Revisar estructura del JSON

### 500 Internal Server Error
- Error en servidor
- Ver logs de console

---

## Postman Collection

Crear nuevo collection e importar esta URL:
```
[Aqui va la URL de export de Postman]
```

O crear manualmente en Postman con los endpoints anteriores.

---

## cURL Examples

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nip": "0001",
    "password": "admin123"
  }'
```

### Obtener Usuarios
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Crear Permiso
```bash
curl -X POST http://localhost:3000/api/permisos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "tipoPermiso": "REUNIoN",
    "fechaInicio": "2024-01-15T08:00:00Z",
    "fechaFin": "2024-01-15T09:00:00Z",
    "descripcion": "Reunion con cliente"
  }'
```

---

## Rate Limiting (Futuro)

NO implementado actualmente. Considerar agregar:
- 100 requests/minuto por usuario
- 1000 requests/minuto por IP

---

## Seguridad

- ✅ Autenticacion JWT
- ✅ Password hashing con bcryptjs
- ✅ Autorizacion basada en roles
- ❌ Rate limiting (TODO)
- ❌ CORS configurado (TODO)
- ❌ Validacion de entrada (TODO)
