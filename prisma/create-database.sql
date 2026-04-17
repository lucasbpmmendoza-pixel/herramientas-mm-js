-- =============================================
-- Script para herramientas-mm-admin
-- Ejecutar en SQL Server Management Studio (SSMS)
-- =============================================
-- IMPORTANTE: En SSMS, al conectarte selecciona la BD 
-- 'herramientas_mm' en el dropdown de bases de datos 
-- (arriba a la izquierda en la barra de herramientas)
-- antes de ejecutar este script.
-- =============================================

-- PASO 1: Crear tabla de usuarios
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE [dbo].[users] (
    [id]        NVARCHAR(25)  NOT NULL,
    [username]  NVARCHAR(255) NOT NULL,
    [nip]       NVARCHAR(255) NOT NULL,
    [password]  NVARCHAR(255) NOT NULL,
    [email]     NVARCHAR(255) NOT NULL,
    [firstName] NVARCHAR(255) NOT NULL,
    [lastName]  NVARCHAR(255) NOT NULL,
    [diasVacaciones]  INT      NOT NULL DEFAULT 0,
    [diasVacUsados]   INT      NOT NULL DEFAULT 0,
    [isAdmin]   BIT           NOT NULL DEFAULT 0,
    [isActive]  BIT           NOT NULL DEFAULT 1,
    [role]      NVARCHAR(10)  NOT NULL DEFAULT 'USER',
    [createdAt] DATETIME2     NOT NULL DEFAULT GETDATE(),
    [updatedAt] DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_users] PRIMARY KEY ([id]),
    CONSTRAINT [UQ_users_username] UNIQUE ([username]),
    CONSTRAINT [UQ_users_nip] UNIQUE ([nip]),
    CONSTRAINT [UQ_users_email] UNIQUE ([email]),
    CONSTRAINT [CK_users_role] CHECK ([role] IN ('USER', 'ADMIN'))
    );
END
GO

-- PASO 2: Crear tabla de permisos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'permisos')
BEGIN
    CREATE TABLE [dbo].[permisos] (
    [id]          NVARCHAR(25)  NOT NULL,
    [userId]      NVARCHAR(25)  NOT NULL,
    [tipoPermiso] NVARCHAR(255) NOT NULL,
    [esMismoDia]  BIT           NOT NULL DEFAULT 0,
    [fechaInicio] DATETIME2     NOT NULL,
    [fechaFin]    DATETIME2     NOT NULL,
    [horaInicio]  NVARCHAR(10)  NULL,
    [horaFin]     NVARCHAR(10)  NULL,
    [descripcion] VARCHAR(500)  NOT NULL,
    [estado]      NVARCHAR(50)  NOT NULL DEFAULT 'PENDIENTE',
    [createdAt]   DATETIME2     NOT NULL DEFAULT GETDATE(),
    [updatedAt]   DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_permisos] PRIMARY KEY ([id]),
    CONSTRAINT [FK_permisos_users] FOREIGN KEY ([userId]) 
        REFERENCES [dbo].[users]([id]) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_permisos_userId')
    CREATE INDEX [IX_permisos_userId] ON [dbo].[permisos]([userId]);
GO

-- PASO 3: Crear tabla de vacaciones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'vacaciones')
BEGIN
    CREATE TABLE [dbo].[vacaciones] (
    [id]          NVARCHAR(25)  NOT NULL,
    [userId]      NVARCHAR(25)  NOT NULL,
    [fechaInicio] DATETIME2     NOT NULL,
    [fechaFin]    DATETIME2     NOT NULL,
    [diasTotal]   INT           NOT NULL,
    [descripcion] VARCHAR(500)  NOT NULL,
    [estado]      NVARCHAR(50)  NOT NULL DEFAULT 'PENDIENTE',
    [createdAt]   DATETIME2     NOT NULL DEFAULT GETDATE(),
    [updatedAt]   DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_vacaciones] PRIMARY KEY ([id]),
    CONSTRAINT [FK_vacaciones_users] FOREIGN KEY ([userId]) 
        REFERENCES [dbo].[users]([id]) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vacaciones_userId')
    CREATE INDEX [IX_vacaciones_userId] ON [dbo].[vacaciones]([userId]);
GO

-- PASO 4: Crear tabla de estadísticas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'estadisticas')
BEGIN
    CREATE TABLE [dbo].[estadisticas] (
    [id]               NVARCHAR(25) NOT NULL,
    [userId]           NVARCHAR(25) NOT NULL,
    [metaTrabajo]      FLOAT        NOT NULL,
    [horasTrabajadas]  FLOAT        NOT NULL,
    [proyectos]        INT          NOT NULL,
    [tareasCompletas]  INT          NOT NULL,
    [tareasRetrasadas] INT          NOT NULL,
    [calificacion]     FLOAT        NOT NULL,
    [mes]              INT          NOT NULL,
    [año]              INT          NOT NULL,
    [createdAt]        DATETIME2    NOT NULL DEFAULT GETDATE(),
    [updatedAt]        DATETIME2    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_estadisticas] PRIMARY KEY ([id]),
    CONSTRAINT [FK_estadisticas_users] FOREIGN KEY ([userId]) 
        REFERENCES [dbo].[users]([id]) ON DELETE CASCADE,
    CONSTRAINT [UQ_estadisticas_user_mes_año] UNIQUE ([userId], [mes], [año])
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_estadisticas_userId')
    CREATE INDEX [IX_estadisticas_userId] ON [dbo].[estadisticas]([userId]);
GO

-- PASO 5: Crear tabla de auditoría
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_logs')
BEGIN
    CREATE TABLE [dbo].[audit_logs] (
    [id]        NVARCHAR(25)   NOT NULL,
    [userId]    NVARCHAR(25)   NOT NULL,
    [accion]    NVARCHAR(255)  NOT NULL,
    [tabla]     NVARCHAR(255)  NOT NULL,
    [recordId]  NVARCHAR(255)  NOT NULL,
    [cambios]   VARCHAR(1000)  NOT NULL,
    [createdAt] DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_audit_logs] PRIMARY KEY ([id]),
    CONSTRAINT [FK_audit_logs_users] FOREIGN KEY ([userId]) 
        REFERENCES [dbo].[users]([id]) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_audit_logs_userId')
    CREATE INDEX [IX_audit_logs_userId] ON [dbo].[audit_logs]([userId]);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_audit_logs_createdAt')
    CREATE INDEX [IX_audit_logs_createdAt] ON [dbo].[audit_logs]([createdAt]);
GO

-- PASO 6: Insertar usuario administrador inicial
-- Password: admin123 (hash bcrypt)
-- NIP: 0001
IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE [nip] = '0001')
BEGIN
    INSERT INTO [dbo].[users] ([id], [username], [nip], [password], [email], [firstName], [lastName], [isAdmin], [isActive], [role], [createdAt], [updatedAt])
    VALUES (
        'admin001',
    'admin',
    '0001',
    '$2a$12$h9.rXcRrfRe7rzvQoN1lz.A8cbyBeEG04.xFSHojzQJtbzO86pT2i',
    'admin@mmendoza.com',
    'Admin',
    'Sistema',
    1,
    1,
    'ADMIN',
        GETDATE(),
        GETDATE()
    );
    PRINT 'Usuario admin creado - NIP: 0001, Password: admin123';
END
GO

PRINT '=============================================';
PRINT 'Base de datos [herramientas_mm] lista.';
PRINT 'Tablas: users, permisos, vacaciones, estadisticas, audit_logs';
PRINT 'Admin: NIP=0001, Password=admin123';
PRINT '=============================================';
GO
