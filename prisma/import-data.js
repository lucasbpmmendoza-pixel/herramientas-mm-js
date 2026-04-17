const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ============================================================
// DATA FROM MySQL DUMPS
// ============================================================

// perfiles_psicometricos - Users with profile info
const perfiles = [
  { nombre: 'Sergio Ivanovich Rosales Marquez', nip: '9625', sexo: 'Masculino', nivelEducativo: 'universitario', area: 'IT', estadoCivil: 'soltero', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'León y Pavo Real', antiguedadAnios: '2024-06-09', analisisNumerologia: null, diasVacaciones: 12, fechaNacimiento: '2025-03-05' },
  { nombre: 'Veronica Aidee Rivera Gonzalez', nip: '3073', sexo: 'Femenino', nivelEducativo: 'universitario', area: 'Administracion', estadoCivil: 'soltera', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'Delfin', antiguedadAnios: '2023-10-29', analisisNumerologia: null, diasVacaciones: 8, fechaNacimiento: '1997-10-22' },
  { nombre: 'Ashley Gamboa Terrazas', nip: '3108', sexo: 'Femenino', nivelEducativo: 'universitario', area: 'Contabilidad', estadoCivil: 'soltera', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'Buho', antiguedadAnios: '2023-02-06', analisisNumerologia: null, diasVacaciones: 8, fechaNacimiento: '1999-12-26' },
  { nombre: 'Aylen Arriaga Saenz', nip: '3724', sexo: 'Femenino', nivelEducativo: 'Preparatoria', area: 'Contabilidad', estadoCivil: 'soltera', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'Delfin y Buho', antiguedadAnios: '2025-06-03', analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: '2007-10-13' },
  { nombre: 'Daniel Alberto Hernandez Barrios', nip: '4357', sexo: 'Masculino', nivelEducativo: 'universitario', area: 'Administracion', estadoCivil: 'soltero', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'Buho y Pavorreal', antiguedadAnios: '2023-06-06', analisisNumerologia: null, diasVacaciones: 13, fechaNacimiento: '1993-09-25' },
  { nombre: 'Maria Fernanda Torres Martinez', nip: '4420', sexo: 'Femenino', nivelEducativo: 'universitario', area: 'Contabilidad', estadoCivil: 'soltera', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'Leon', antiguedadAnios: '2022-02-28', analisisNumerologia: null, diasVacaciones: 18, fechaNacimiento: '2002-02-05' },
  { nombre: 'Haydee Fabiola Burciaga Perez', nip: '4750', sexo: 'Femenino', nivelEducativo: 'universitario', area: 'Contabilidad y gerencia', estadoCivil: 'viuda', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'Leon', antiguedadAnios: '2023-06-14', analisisNumerologia: null, diasVacaciones: 10, fechaNacimiento: '1987-08-09' },
  { nombre: 'Angel Jose Duarte Rubio', nip: '5693', sexo: 'Masculino', nivelEducativo: 'universitario', area: 'Administracion', estadoCivil: 'divorciado', respuestaMentalidad: 'Intermedio', respuestaComunicacion: 'Pavorreal', antiguedadAnios: '2023-02-19', analisisNumerologia: null, diasVacaciones: 10, fechaNacimiento: '1991-01-16' },
  { nombre: 'Diana Blanca Chavez Barraza', nip: '6015', sexo: 'Femenino', nivelEducativo: 'universitario', area: 'Administracion', estadoCivil: 'soltera', respuestaMentalidad: 'Fija', respuestaComunicacion: 'Delfin', antiguedadAnios: '2023-09-18', analisisNumerologia: null, diasVacaciones: 9, fechaNacimiento: '1999-07-16' },
  { nombre: 'Brenda Lorena Favela Olmos', nip: '6125', sexo: 'Femenino', nivelEducativo: 'universitario', area: 'Contabilidad', estadoCivil: 'soltera', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'Leon y Delfin', antiguedadAnios: '2024-08-20', analisisNumerologia: null, diasVacaciones: 10, fechaNacimiento: '2000-07-30' },
  { nombre: 'Aylinne Andrea Jerez Mata', nip: '7886', sexo: 'Femenino', nivelEducativo: 'universitario', area: 'Contabilidad', estadoCivil: 'soltera', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'Buho', antiguedadAnios: '2022-01-28', analisisNumerologia: null, diasVacaciones: 9, fechaNacimiento: '2002-02-04' },
  { nombre: 'Jesus Martin Olague Amavisca', nip: '8211', sexo: 'Masculino', nivelEducativo: 'universitario', area: 'Contabilidad', estadoCivil: 'soltero', respuestaMentalidad: 'Fija', respuestaComunicacion: 'Delfin y Buho', antiguedadAnios: '2023-09-18', analisisNumerologia: null, diasVacaciones: 13, fechaNacimiento: '2000-05-03' },
  { nombre: 'Carla de Aguinaga Ramirez', nip: '9945', sexo: 'Femenino', nivelEducativo: 'universitario', area: 'Administracion', estadoCivil: 'soltera', respuestaMentalidad: 'Intermedia', respuestaComunicacion: 'Delfin y Buho', antiguedadAnios: '2025-05-26', analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: '1987-02-28' },
  { nombre: 'Mauricio Mendoza', nip: '9999', sexo: 'Masculino', nivelEducativo: 'Universitario', area: 'CEO', estadoCivil: 'Casado', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'Delfin', antiguedadAnios: '2022-01-01', analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: '1988-03-29' },
  { nombre: 'Ana Gabriela Alvidrez Pedroza', nip: '8314', sexo: 'Femenino', nivelEducativo: 'universitario', area: 'Contabilidad', estadoCivil: 'casado', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'León y Pavo Real', antiguedadAnios: '2025-07-17', analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: '1989-05-08' },
  { nombre: 'Alejandro Gonzalez Garcia', nip: '6821', sexo: null, nivelEducativo: null, area: 'Tecnico', estadoCivil: null, respuestaMentalidad: null, respuestaComunicacion: null, antiguedadAnios: null, analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: null },
  { nombre: 'Nazaria Alejandra Villalobos Ramirez', nip: '8517', sexo: 'Femenino', nivelEducativo: 'bachillerato', area: 'ADMINISTRATIVO', estadoCivil: 'soltero', respuestaMentalidad: 'Crecimiento', respuestaComunicacion: 'León y Delfín', antiguedadAnios: '2025-10-02', analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: '1992-03-14' },
  { nombre: 'Javier Alberto Duen Saenz', nip: '9676', sexo: null, nivelEducativo: null, area: 'Tecnico', estadoCivil: null, respuestaMentalidad: null, respuestaComunicacion: null, antiguedadAnios: null, analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: null },
  { nombre: 'Lilia Patricia Mercado Garza', nip: '6845', sexo: null, nivelEducativo: null, area: null, estadoCivil: null, respuestaMentalidad: null, respuestaComunicacion: null, antiguedadAnios: null, analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: null },
  { nombre: 'David Sanchez Gomez', nip: '9852', sexo: null, nivelEducativo: null, area: null, estadoCivil: null, respuestaMentalidad: null, respuestaComunicacion: null, antiguedadAnios: null, analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: null },
  { nombre: 'Liliana Lizeth Davila Mendoza', nip: '5162', sexo: null, nivelEducativo: null, area: null, estadoCivil: null, respuestaMentalidad: null, respuestaComunicacion: null, antiguedadAnios: null, analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: null },
  { nombre: 'Martin Osvaldo Oliveros Arriata', nip: '6189', sexo: null, nivelEducativo: null, area: null, estadoCivil: null, respuestaMentalidad: null, respuestaComunicacion: null, antiguedadAnios: null, analisisNumerologia: null, diasVacaciones: 0, fechaNacimiento: null },
];

// Additional users only found in other tables (not in perfiles)
const extraUsers = [
  { nombre: 'Kimberly Denisse Rueda Arias', nip: '2179' },
  { nombre: 'Colaborador 4895', nip: '4895' },
  { nombre: 'Colaborador 4928', nip: '4928' },
  { nombre: 'Colaborador 5393', nip: '5393' },
  { nombre: 'Colaborador 6423', nip: '6423' },
  { nombre: 'Colaborador 6498', nip: '6498' },
  { nombre: 'Colaborador 6523', nip: '6523' },
  { nombre: 'Colaborador 6724', nip: '6724' },
  { nombre: 'Colaborador 9568', nip: '9568' },
  { nombre: 'Colaborador 9763', nip: '9763' },
  { nombre: 'Colaborador 9816', nip: '9816' },
  { nombre: 'Colaborador 9845', nip: '9845' },
];

// Update extra users with names from solicitud tables where available
const nameOverrides = {
  '2179': 'Kimberly Denisse Rueda Arias',
  '9568': 'Alondra R. Soltero Bernal',
  '9816': 'Gerardo Andres Felix Irigoyen',
  '4928': 'Sergio Garcia Castro',
  '6523': 'Salvador Alonso Bueno Del Toro',
};

// inasistencias → Incidencia tipo=FALTA
const inasistencias = [
  { nip: '6724', fecha: '2025-06-26', descripcion: '' },
  { nip: '6724', fecha: '2025-06-27', descripcion: '' },
  { nip: '6423', fecha: '2025-05-19', descripcion: '' },
  { nip: '6423', fecha: '2025-05-10', descripcion: '' },
  { nip: '6423', fecha: '2025-06-02', descripcion: '' },
  { nip: '6423', fecha: '2025-06-24', descripcion: '' },
  { nip: '6423', fecha: '2025-07-04', descripcion: '' },
  { nip: '4895', fecha: '2025-07-16', descripcion: 'NA' },
  { nip: '3108', fecha: '2025-07-28', descripcion: 'FAMILIAR' },
  { nip: '3073', fecha: '2025-08-29', descripcion: 'N/A' },
  { nip: '5693', fecha: '2025-10-11', descripcion: 'NO SE PRESENTO A LABORAR EL DIA 11 DE OCTUBRE DE 2025 Y TAL FECHA NO SE JUSTIFICO' },
  { nip: '8517', fecha: '2025-12-13', descripcion: 'N/A' },
  { nip: '3073', fecha: '2025-12-13', descripcion: 'N/A' },
  { nip: '3724', fecha: '2025-12-13', descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-01-26', descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-02-12', descripcion: 'N/A' },
  { nip: '5693', fecha: '2026-02-18', descripcion: 'PERSONAL' },
  { nip: '5693', fecha: '2026-01-12', descripcion: 'N/A' },
  { nip: '6845', fecha: '2026-02-23', descripcion: 'N/A' },
  { nip: '6845', fecha: '2026-02-24', descripcion: 'N/A' },
  { nip: '6845', fecha: '2026-02-19', descripcion: 'N/A' },
  { nip: '5693', fecha: '2026-03-02', descripcion: 'N/A' },
  { nip: '6845', fecha: '2026-02-20', descripcion: 'NA' },
  { nip: '3073', fecha: '2026-04-06', descripcion: 'N/A' },
];

// retardos → Incidencia tipo=RETARDO (extracted from SQL)
const retardos = [
  { nip: '3108', fecha: '2025-06-17', minutos: null, descripcion: '' },
  { nip: '3073', fecha: '2025-01-22', minutos: null, descripcion: '' },
  { nip: '3073', fecha: '2025-01-23', minutos: null, descripcion: '' },
  { nip: '3073', fecha: '2025-02-27', minutos: null, descripcion: '' },
  { nip: '3073', fecha: '2025-04-11', minutos: null, descripcion: '' },
  { nip: '3073', fecha: '2025-06-20', minutos: null, descripcion: '' },
  { nip: '3073', fecha: '2025-06-25', minutos: null, descripcion: '' },
  { nip: '4420', fecha: '2025-04-29', minutos: null, descripcion: '' },
  { nip: '9845', fecha: '2025-05-30', minutos: null, descripcion: '' },
  { nip: '9845', fecha: '2025-06-03', minutos: null, descripcion: '' },
  { nip: '9845', fecha: '2025-06-12', minutos: null, descripcion: '' },
  { nip: '9845', fecha: '2025-06-25', minutos: null, descripcion: '' },
  { nip: '9845', fecha: '2025-06-27', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-02-10', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-02-12', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-02-17', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-02-18', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-02-19', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-02-21', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-03-10', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-03-20', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-03-24', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-03-25', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-03-26', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-03-27', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-04-01', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-04-02', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-04-04', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-04-03', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-04-07', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-04-11', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-04-14', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-04-25', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-05-05', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-05-26', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-05-28', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-06-02', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-06-23', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-06-25', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-06-27', minutos: null, descripcion: '' },
  { nip: '9625', fecha: '2025-06-25', minutos: null, descripcion: '' },
  { nip: '6423', fecha: '2025-04-25', minutos: null, descripcion: '' },
  { nip: '6423', fecha: '2025-04-30', minutos: null, descripcion: '' },
  { nip: '6423', fecha: '2025-05-07', minutos: null, descripcion: '' },
  { nip: '6423', fecha: '2025-05-28', minutos: null, descripcion: '' },
  { nip: '6423', fecha: '2025-06-17', minutos: null, descripcion: '' },
  { nip: '6423', fecha: '2025-06-18', minutos: null, descripcion: '' },
  { nip: '9763', fecha: '2025-06-27', minutos: null, descripcion: '' },
  { nip: '6125', fecha: '2025-01-20', minutos: null, descripcion: '' },
  { nip: '6125', fecha: '2025-04-09', minutos: null, descripcion: '' },
  { nip: '5693', fecha: '2025-01-17', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-01-13', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-02-05', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-02-10', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-02-13', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-02-17', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-02-21', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-02-25', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-02-26', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-03-18', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-03-20', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-03-25', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-03-27', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-04-02', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-04-03', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-04-07', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-04-17', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-04-23', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-04-28', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-04-29', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-05-06', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-05-07', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-05-08', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-05-09', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-05-13', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-05-14', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-06-20', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-06-27', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-02-19', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-03-20', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-03-25', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-03-27', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-04-01', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-04-02', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-04-03', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-05-07', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-05-08', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-05-27', minutos: null, descripcion: '' },
  { nip: '6498', fecha: '2025-05-30', minutos: null, descripcion: '' },
  { nip: '7886', fecha: '2025-02-28', minutos: null, descripcion: '' },
  { nip: '4750', fecha: '2025-01-20', minutos: null, descripcion: '' },
  { nip: '2179', fecha: '2025-01-22', minutos: null, descripcion: '' },
  { nip: '2179', fecha: '2025-01-23', minutos: null, descripcion: '' },
  { nip: '9625', fecha: '2025-07-03', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-05-30', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-06-03', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-06-12', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-06-25', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-06-27', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-07-01', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-07-03', minutos: null, descripcion: '' },
  { nip: '3073', fecha: '2025-07-04', minutos: null, descripcion: '' },
  { nip: '3073', fecha: '2025-07-04', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-07-03', minutos: null, descripcion: '' },
  { nip: '6423', fecha: '2025-07-03', minutos: 31, descripcion: '' },
  { nip: '4895', fecha: '2025-07-01', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-07-09', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-07-08', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-07-11', minutos: null, descripcion: '' },
  { nip: '6423', fecha: '2025-07-11', minutos: null, descripcion: '' },
  { nip: '9625', fecha: '2025-07-07', minutos: null, descripcion: '' },
  { nip: '9625', fecha: '2025-07-09', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-07-07', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-07-08', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-07-17', minutos: null, descripcion: '' },
  { nip: '6423', fecha: '2025-07-17', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-07-14', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-07-15', minutos: null, descripcion: '' },
  { nip: '9625', fecha: '2025-07-14', minutos: null, descripcion: '' },
  { nip: '9625', fecha: '2025-07-15', minutos: null, descripcion: '' },
  { nip: '9625', fecha: '2025-07-17', minutos: null, descripcion: '' },
  { nip: '9763', fecha: '2025-07-17', minutos: null, descripcion: '' },
  { nip: '9763', fecha: '2025-07-18', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-07-15', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-07-21', minutos: null, descripcion: '' },
  { nip: '4357', fecha: '2025-07-23', minutos: null, descripcion: '' },
  { nip: '4420', fecha: '2025-07-21', minutos: null, descripcion: '' },
  { nip: '7886', fecha: '2025-07-21', minutos: null, descripcion: '' },
  { nip: '8314', fecha: '2025-07-21', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-07-21', minutos: 23, descripcion: '' },
  { nip: '9625', fecha: '2025-07-21', minutos: 21, descripcion: '' },
  { nip: '9625', fecha: '2025-07-24', minutos: 24, descripcion: '' },
  { nip: '9763', fecha: '2025-07-24', minutos: null, descripcion: '' },
  { nip: '4895', fecha: '2025-07-21', minutos: 39, descripcion: '' },
  { nip: '4895', fecha: '2025-07-22', minutos: 25, descripcion: '' },
  { nip: '6724', fecha: '2025-07-31', minutos: 34, descripcion: '' },
  { nip: '9568', fecha: '2025-07-28', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-07-31', minutos: null, descripcion: '' },
  { nip: '9625', fecha: '2025-07-29', minutos: null, descripcion: '' },
  { nip: '9763', fecha: '2025-07-31', minutos: null, descripcion: '' },
  { nip: '9763', fecha: '2025-08-01', minutos: null, descripcion: '' },
  { nip: '9568', fecha: '2025-08-04', minutos: null, descripcion: 'NA' },
  { nip: '3073', fecha: '2025-08-04', minutos: null, descripcion: 'NA' },
  { nip: '6423', fecha: '2025-08-04', minutos: null, descripcion: 'NA' },
  { nip: '9568', fecha: '2025-08-05', minutos: null, descripcion: 'NA' },
  { nip: '3073', fecha: '2025-08-05', minutos: null, descripcion: 'NA' },
  { nip: '9625', fecha: '2025-08-05', minutos: null, descripcion: 'NA' },
  { nip: '3073', fecha: '2025-08-06', minutos: null, descripcion: 'NA' },
  { nip: '9568', fecha: '2025-08-06', minutos: null, descripcion: 'NA' },
  { nip: '9568', fecha: '2025-08-07', minutos: null, descripcion: 'NA' },
  { nip: '9625', fecha: '2025-09-07', minutos: 27, descripcion: 'NA' },
  { nip: '9763', fecha: '2025-08-08', minutos: null, descripcion: 'NA' },
  { nip: '3724', fecha: '2025-08-08', minutos: null, descripcion: 'NA' },
  { nip: '9568', fecha: '2025-08-08', minutos: 22, descripcion: 'NA' },
  { nip: '8314', fecha: '2025-08-19', minutos: 13, descripcion: 'na' },
  { nip: '9568', fecha: '2025-08-18', minutos: 32, descripcion: 'na' },
  { nip: '9568', fecha: '2025-08-20', minutos: 24, descripcion: 'na' },
  { nip: '9568', fecha: '2025-08-21', minutos: 13, descripcion: 'na' },
  { nip: '9625', fecha: '2025-08-21', minutos: 14, descripcion: 'na' },
  { nip: '9763', fecha: '2025-08-21', minutos: 13, descripcion: 'na' },
  { nip: '9763', fecha: '2025-08-22', minutos: 16, descripcion: 'na' },
  { nip: '4357', fecha: '2025-08-25', minutos: 14, descripcion: 'N/A' },
  { nip: '4357', fecha: '2025-08-27', minutos: 18, descripcion: 'N/A' },
  { nip: '4357', fecha: '2025-08-29', minutos: 18, descripcion: 'N/A' },
  { nip: '6125', fecha: '2025-08-25', minutos: 13, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-08-25', minutos: 13, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-08-29', minutos: 18, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-08-25', minutos: 24, descripcion: 'N/A' },
  { nip: '9763', fecha: '2025-08-26', minutos: 12, descripcion: 'NA' },
  { nip: '4357', fecha: '2025-09-02', minutos: 22, descripcion: 'N/A' },
  { nip: '4357', fecha: '2025-09-03', minutos: 19, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-09-03', minutos: 13, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-09-02', minutos: 17, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-09-04', minutos: 19, descripcion: 'N/A' },
  { nip: '9763', fecha: '2025-09-03', minutos: 14, descripcion: 'N/A' },
  { nip: '4357', fecha: '2025-09-09', minutos: 15, descripcion: 'n/a' },
  { nip: '8517', fecha: '2025-09-09', minutos: 13, descripcion: 'n/a' },
  { nip: '9568', fecha: '2025-09-08', minutos: 30, descripcion: 'n/a' },
  { nip: '9568', fecha: '2025-09-10', minutos: 14, descripcion: 'n/a' },
  { nip: '9568', fecha: '2025-09-12', minutos: 12, descripcion: 'n/a' },
  { nip: '9625', fecha: '2025-09-09', minutos: 15, descripcion: 'n/a' },
  { nip: '9625', fecha: '2025-09-11', minutos: 11, descripcion: 'n/a' },
  { nip: '9763', fecha: '2025-09-09', minutos: 12, descripcion: 'n/a' },
  { nip: '9763', fecha: '2025-09-10', minutos: 11, descripcion: 'n/a' },
  { nip: '9945', fecha: '2025-09-09', minutos: 12, descripcion: 'n/a' },
  { nip: '4357', fecha: '2025-09-17', minutos: 12, descripcion: 'N/A' },
  { nip: '4420', fecha: '2025-09-16', minutos: 15, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-09-16', minutos: 11, descripcion: 'N/A' },
  { nip: '3108', fecha: '2025-09-23', minutos: 18, descripcion: 'N/A' },
  { nip: '4357', fecha: '2025-09-23', minutos: 20, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-09-23', minutos: 14, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-09-24', minutos: 11, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-09-25', minutos: 11, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-09-26', minutos: 14, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-09-22', minutos: 22, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-09-19', minutos: 11, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-03', minutos: 4, descripcion: '' },
  { nip: '3073', fecha: '2025-10-03', minutos: 30, descripcion: 'LLEVO A SU HIJO AL PUNTE INTERNACIONAL' },
  { nip: '4357', fecha: '2025-09-30', minutos: 20, descripcion: 'N/A' },
  { nip: '4357', fecha: '2025-10-03', minutos: 20, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-09-30', minutos: 13, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-03', minutos: 11, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-09-29', minutos: 25, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-07', minutos: 6, descripcion: '' },
  { nip: '9625', fecha: '2025-10-08', minutos: 9, descripcion: '' },
  { nip: '9568', fecha: '2025-10-09', minutos: 6, descripcion: '' },
  { nip: '3108', fecha: '2025-10-09', minutos: 4, descripcion: '' },
  { nip: '9625', fecha: '2025-10-10', minutos: 1, descripcion: '' },
  { nip: '3108', fecha: '2025-10-09', minutos: 12, descripcion: 'n/a' },
  { nip: '4357', fecha: '2025-10-06', minutos: 11, descripcion: 'n/a' },
  { nip: '9568', fecha: '2025-10-07', minutos: 13, descripcion: 'n/a' },
  { nip: '9568', fecha: '2025-10-09', minutos: 13, descripcion: 'n/a' },
  { nip: '9625', fecha: '2025-10-06', minutos: 19, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-10-08', minutos: 17, descripcion: 'N/A' },
  { nip: '9763', fecha: '2025-10-14', minutos: 2, descripcion: '' },
  { nip: '8517', fecha: '2025-10-14', minutos: 22, descripcion: '' },
  { nip: '8314', fecha: '2025-10-14', minutos: 17, descripcion: '' },
  { nip: '9763', fecha: '2025-10-15', minutos: 2, descripcion: '' },
  { nip: '9568', fecha: '2025-10-15', minutos: 3, descripcion: '' },
  { nip: '9816', fecha: '2025-10-16', minutos: 3, descripcion: '' },
  { nip: '9568', fecha: '2025-10-16', minutos: 8, descripcion: '' },
  { nip: '9763', fecha: '2025-10-22', minutos: 15, descripcion: '' },
  { nip: '9568', fecha: '2025-10-22', minutos: 2, descripcion: '' },
  { nip: '9568', fecha: '2025-10-23', minutos: 1, descripcion: '' },
  { nip: '9625', fecha: '2025-10-23', minutos: 8, descripcion: '' },
  { nip: '9568', fecha: '2025-10-24', minutos: 2, descripcion: '' },
  { nip: '3108', fecha: '2025-10-17', minutos: 20, descripcion: 'N/A' },
  { nip: '8314', fecha: '2025-10-14', minutos: 24, descripcion: 'LLUVIA, HUBO DIFICULTAD EN EL TRAFICO' },
  { nip: '6821', fecha: '2025-10-14', minutos: 15, descripcion: 'HUBO PROBLEMAS PARA LLEGAR POR LA LLUVIA' },
  { nip: '8517', fecha: '2025-10-16', minutos: 13, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-16', minutos: 15, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-10-27', minutos: 17, descripcion: '' },
  { nip: '9625', fecha: '2025-10-16', minutos: 17, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-10-17', minutos: 17, descripcion: 'N/A' },
  { nip: '9945', fecha: '2025-10-14', minutos: 75, descripcion: 'SE LES DIO TOLERANCIA YA QUE LLOVIO' },
  { nip: '9568', fecha: '2025-10-27', minutos: 1, descripcion: '' },
  { nip: '9625', fecha: '2025-10-27', minutos: 14, descripcion: '' },
  { nip: '9568', fecha: '2025-10-28', minutos: 3, descripcion: '' },
  { nip: '8517', fecha: '2025-10-20', minutos: 13, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-22', minutos: 13, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-23', minutos: 12, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-24', minutos: 12, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-10-23', minutos: 19, descripcion: 'N/A' },
  { nip: '9763', fecha: '2025-10-21', minutos: 13, descripcion: 'N/A' },
  { nip: '9763', fecha: '2025-10-22', minutos: 26, descripcion: 'N/A' },
  { nip: '9945', fecha: '2025-10-23', minutos: 18, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-29', minutos: 4, descripcion: '' },
  { nip: '5693', fecha: '2025-10-31', minutos: 30, descripcion: 'N/A' },
  { nip: '8517', fecha: '2025-10-28', minutos: 13, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-27', minutos: 12, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-28', minutos: 13, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-10-29', minutos: 14, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-10-27', minutos: 24, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-10-28', minutos: 19, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-11-04', minutos: 8, descripcion: '' },
  { nip: '9625', fecha: '2025-11-04', minutos: 12, descripcion: '' },
  { nip: '9625', fecha: '2025-11-05', minutos: 8, descripcion: '' },
  { nip: '5693', fecha: '2025-11-06', minutos: null, descripcion: 'NO CHECO INGRESO' },
  { nip: '8517', fecha: '2025-11-05', minutos: 14, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-11-04', minutos: 19, descripcion: 'N/A' },
  { nip: '9568', fecha: '2025-11-05', minutos: 22, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-11-04', minutos: 23, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-11-05', minutos: 18, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-11-06', minutos: null, descripcion: 'NO CHECO HORA DE INGRESO' },
  { nip: '8517', fecha: '2025-11-13', minutos: 2, descripcion: '' },
  { nip: '8517', fecha: '2025-11-13', minutos: 12, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-11-10', minutos: 14, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-11-12', minutos: 16, descripcion: 'N/A' },
  { nip: '5693', fecha: '2025-11-14', minutos: 90, descripcion: 'PONCHO EL CARRO' },
  { nip: '9945', fecha: '2025-11-19', minutos: 76, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-11-19', minutos: 11, descripcion: '' },
  { nip: '4357', fecha: '2025-11-18', minutos: 14, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-11-19', minutos: 21, descripcion: 'N/A' },
  { nip: '9945', fecha: '2025-11-19', minutos: 16, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-11-24', minutos: 4, descripcion: '' },
  { nip: '8517', fecha: '2025-11-26', minutos: 1, descripcion: '' },
  { nip: '3724', fecha: '2025-12-01', minutos: 17, descripcion: '' },
  { nip: '3724', fecha: '2025-11-26', minutos: 18, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-12-02', minutos: 11, descripcion: '' },
  { nip: '8517', fecha: '2025-12-03', minutos: 1, descripcion: '' },
  { nip: '5693', fecha: '2025-12-08', minutos: 3, descripcion: '' },
  { nip: '9625', fecha: '2025-12-08', minutos: 11, descripcion: '' },
  { nip: '5693', fecha: '2025-12-05', minutos: 19, descripcion: 'N/a' },
  { nip: '6821', fecha: '2025-12-03', minutos: 18, descripcion: 'N/a' },
  { nip: '9625', fecha: '2025-12-01', minutos: 13, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-12-02', minutos: 20, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-12-09', minutos: 10, descripcion: '' },
  { nip: '8517', fecha: '2025-12-10', minutos: 4, descripcion: '' },
  { nip: '4420', fecha: '2025-12-10', minutos: 3, descripcion: '' },
  { nip: '8517', fecha: '2025-12-12', minutos: 4, descripcion: '' },
  { nip: '4420', fecha: '2025-12-12', minutos: 3, descripcion: '' },
  { nip: '3724', fecha: '2025-12-09', minutos: 14, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-12-19', minutos: 10, descripcion: '' },
  { nip: '9625', fecha: '2025-12-22', minutos: 7, descripcion: '' },
  { nip: '8517', fecha: '2025-12-26', minutos: 28, descripcion: '' },
  { nip: '3724', fecha: '2025-12-17', minutos: 20, descripcion: 'N/A' },
  { nip: '4357', fecha: '2025-12-17', minutos: 17, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-12-19', minutos: 20, descripcion: 'N-A' },
  { nip: '6845', fecha: '2025-12-23', minutos: 14, descripcion: 'N/A' },
  { nip: '8314', fecha: '2025-12-23', minutos: 23, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-12-22', minutos: 17, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-12-24', minutos: 39, descripcion: 'N/A' },
  { nip: '8314', fecha: '2025-12-30', minutos: 6, descripcion: '' },
  { nip: '9625', fecha: '2025-12-30', minutos: 5, descripcion: '' },
  { nip: '8314', fecha: '2026-01-02', minutos: 5, descripcion: '' },
  { nip: '6821', fecha: '2025-12-31', minutos: 14, descripcion: 'n/a' },
  { nip: '8314', fecha: '2025-12-29', minutos: 11, descripcion: 'n/a' },
  { nip: '8314', fecha: '2025-12-30', minutos: 16, descripcion: 'n/a' },
  { nip: '8314', fecha: '2025-12-31', minutos: 12, descripcion: 'n/a' },
  { nip: '8314', fecha: '2026-01-02', minutos: 16, descripcion: 'n/a' },
  { nip: '8517', fecha: '2025-12-31', minutos: 12, descripcion: 'n/a' },
  { nip: '9625', fecha: '2025-12-29', minutos: 17, descripcion: 'n/a' },
  { nip: '9625', fecha: '2025-12-30', minutos: 16, descripcion: 'n/a' },
  { nip: '4357', fecha: '2026-01-05', minutos: 19, descripcion: 'N/A' },
  { nip: '5693', fecha: '2025-01-07', minutos: 30, descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-01-09', minutos: 13, descripcion: 'N/A' },
  { nip: '8314', fecha: '2026-01-09', minutos: 16, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-01-05', minutos: 17, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-01-06', minutos: 60, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-01-08', minutos: 18, descripcion: 'N/A' },
  { nip: '4750', fecha: '2026-01-26', minutos: 26, descripcion: 'N/A' },
  { nip: '5693', fecha: '2026-01-29', minutos: 20, descripcion: 'N/A' },
  { nip: '5693', fecha: '2026-01-30', minutos: 20, descripcion: 'N/A' },
  { nip: '6845', fecha: '2026-01-30', minutos: 17, descripcion: 'N/A' },
  { nip: '8314', fecha: '2026-01-26', minutos: 26, descripcion: 'N/A' },
  { nip: '8517', fecha: '2026-01-26', minutos: 13, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-01-28', minutos: 26, descripcion: 'N/A' },
  { nip: '9852', fecha: '2026-01-26', minutos: 14, descripcion: 'N/A' },
  { nip: '9852', fecha: '2026-01-27', minutos: 13, descripcion: 'N/A' },
  { nip: '9852', fecha: '2026-01-28', minutos: 19, descripcion: 'N/A' },
  { nip: '4420', fecha: '2026-02-05', minutos: 15, descripcion: 'N/A' },
  { nip: '4420', fecha: '2026-02-06', minutos: 13, descripcion: 'N/A' },
  { nip: '5693', fecha: '2026-02-05', minutos: 16, descripcion: 'N/A' },
  { nip: '5693', fecha: '2025-02-06', minutos: 40, descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-02-04', minutos: 15, descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-02-05', minutos: 11, descripcion: 'N/A' },
  { nip: '6845', fecha: '2026-02-03', minutos: 11, descripcion: 'N/A' },
  { nip: '9625', fecha: '2025-02-03', minutos: 25, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-02-04', minutos: 22, descripcion: 'N/A' },
  { nip: '5693', fecha: '2026-02-06', minutos: 11, descripcion: 'N/A' },
  { nip: '9852', fecha: '2026-02-03', minutos: 26, descripcion: 'N/A' },
  { nip: '4357', fecha: '2026-02-09', minutos: 12, descripcion: 'N/A' },
  { nip: '5693', fecha: '2026-02-10', minutos: 14, descripcion: 'N/A' },
  { nip: '6845', fecha: '2026-02-12', minutos: 12, descripcion: 'N/A' },
  { nip: '6845', fecha: '2026-02-13', minutos: 22, descripcion: 'N/A' },
  { nip: '8517', fecha: '2026-02-11', minutos: 14, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-02-09', minutos: 19, descripcion: 'N/A' },
  { nip: '9852', fecha: '2026-02-10', minutos: 27, descripcion: 'N/A' },
  { nip: '9852', fecha: '2026-02-13', minutos: 19, descripcion: 'N/A' },
  { nip: '9945', fecha: '2026-02-10', minutos: 13, descripcion: 'N/A' },
  { nip: '3073', fecha: '2026-02-14', minutos: 13, descripcion: 'N/A' },
  { nip: '4420', fecha: '2026-02-14', minutos: 15, descripcion: 'N/A' },
  { nip: '5693', fecha: '2026-02-14', minutos: 11, descripcion: 'N/A' },
  { nip: '8314', fecha: '2026-02-14', minutos: 21, descripcion: 'N/A' },
  { nip: '8314', fecha: '2026-02-16', minutos: 16, descripcion: 'N/A' },
  { nip: '8314', fecha: '2026-02-19', minutos: 14, descripcion: 'N/A' },
  { nip: '8517', fecha: '2026-02-20', minutos: 13, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-02-14', minutos: 32, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-02-16', minutos: 16, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-02-17', minutos: 24, descripcion: 'N/A' },
  { nip: '9852', fecha: '2026-02-17', minutos: 20, descripcion: 'N/A' },
  { nip: '8314', fecha: '2026-02-17', minutos: 14, descripcion: 'N/A' },
  { nip: '6821', fecha: '2026-02-17', minutos: 11, descripcion: 'N/A' },
  { nip: '4357', fecha: '2026-02-23', minutos: 26, descripcion: 'N/A' },
  { nip: '4357', fecha: '2026-02-25', minutos: 17, descripcion: 'N/A' },
  { nip: '5162', fecha: '2026-02-24', minutos: 21, descripcion: 'N/A' },
  { nip: '5693', fecha: '2026-02-25', minutos: 20, descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-02-23', minutos: 12, descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-02-27', minutos: 11, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-02-24', minutos: 19, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-02-27', minutos: 28, descripcion: 'N/A' },
  { nip: '9852', fecha: '2026-02-23', minutos: 12, descripcion: 'N/A' },
  { nip: '9852', fecha: '2026-02-24', minutos: 13, descripcion: 'N/A' },
  { nip: '3073', fecha: '2026-03-06', minutos: 13, descripcion: 'N/A' },
  { nip: '4357', fecha: '2026-03-04', minutos: 17, descripcion: 'N/A' },
  { nip: '5162', fecha: '2026-03-20', minutos: 12, descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-03-02', minutos: 12, descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-03-05', minutos: 11, descripcion: 'N/A' },
  { nip: '6845', fecha: '2026-03-30', minutos: 12, descripcion: 'N/A' },
  { nip: '8517', fecha: '2026-03-04', minutos: 34, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-03-02', minutos: 15, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-03-06', minutos: 22, descripcion: 'N/A' },
  { nip: '4420', fecha: '2026-03-12', minutos: 13, descripcion: 'N/A' },
  { nip: '4420', fecha: '2026-03-13', minutos: 16, descripcion: 'N/A' },
  { nip: '5162', fecha: '2026-03-11', minutos: 16, descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-03-09', minutos: 12, descripcion: 'N/A' },
  { nip: '6189', fecha: '2026-03-10', minutos: 13, descripcion: 'N/A' },
  { nip: '6845', fecha: '2026-03-12', minutos: 14, descripcion: 'N/A' },
  { nip: '8314', fecha: '2026-03-12', minutos: 17, descripcion: 'N/A' },
  { nip: '8314', fecha: '2026-03-13', minutos: 17, descripcion: 'N/A' },
  { nip: '8517', fecha: '2026-03-10', minutos: 13, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-03-10', minutos: 18, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-03-12', minutos: 19, descripcion: 'N/A' },
  { nip: '9945', fecha: '2026-03-11', minutos: 18, descripcion: 'N/A' },
  { nip: '5162', fecha: '2026-03-18', minutos: 15, descripcion: 'n/a' },
  { nip: '6189', fecha: '2026-03-17', minutos: 11, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-03-16', minutos: 30, descripcion: 'N/A' },
  { nip: '3073', fecha: '2026-03-14', minutos: 19, descripcion: 'N/A' },
  { nip: '4420', fecha: '2026-03-14', minutos: 27, descripcion: 'N/A' },
  { nip: '3724', fecha: '2026-03-14', minutos: 19, descripcion: 'N/A' },
  { nip: '8314', fecha: '2026-03-14', minutos: 27, descripcion: 'N/A' },
  { nip: '4357', fecha: '2026-03-25', minutos: 13, descripcion: 'N/A' },
  { nip: '4420', fecha: '2026-03-23', minutos: 15, descripcion: 'N/A' },
  { nip: '4420', fecha: '2026-03-25', minutos: 18, descripcion: 'N/A' },
  { nip: '4420', fecha: '2026-03-26', minutos: 14, descripcion: 'N/A' },
  { nip: '4750', fecha: '2026-03-24', minutos: 16, descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-03-26', minutos: 11, descripcion: 'N/A' },
  { nip: '6125', fecha: '2026-03-27', minutos: 11, descripcion: 'N/A' },
  { nip: '6189', fecha: '2026-03-24', minutos: 12, descripcion: 'N/A' },
  { nip: '6189', fecha: '2026-03-26', minutos: 12, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-03-24', minutos: 25, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-03-26', minutos: 21, descripcion: 'N/A' },
  { nip: '3073', fecha: '2026-04-02', minutos: 30, descripcion: 'N/A' },
  { nip: '9625', fecha: '2026-03-31', minutos: 17, descripcion: 'N/A' },
];

// permisos (admin-recorded) → Permiso
const permisosAdmin = [
  { nip: '3108', fechaInicio: '2025-01-15', fechaFin: '2025-01-15', motivo: 'Personal', duracion: '1 dia' },
  { nip: '3108', fechaInicio: '2025-07-16', fechaFin: '2025-07-16', motivo: 'Personal', duracion: '1 dia' },
  { nip: '3108', fechaInicio: '2025-02-17', fechaFin: '2025-02-17', motivo: 'Personal', duracion: '1 dia' },
  { nip: '3108', fechaInicio: '2025-04-30', fechaFin: '2025-04-30', motivo: 'Personal', duracion: '1 dia' },
  { nip: '3108', fechaInicio: '2025-04-15', fechaFin: '2025-04-15', motivo: 'Personal', duracion: '1 dia' },
  { nip: '3073', fechaInicio: '2025-01-31', fechaFin: '2025-01-31', motivo: 'Personal', duracion: '1 dia' },
  { nip: '3073', fechaInicio: '2025-02-25', fechaFin: '2025-02-25', motivo: 'Personal', duracion: '1 dia' },
  { nip: '9845', fechaInicio: '2025-05-20', fechaFin: '2025-05-20', motivo: 'Personal', duracion: '1 dia' },
  { nip: '9845', fechaInicio: '2025-06-12', fechaFin: '2025-06-12', motivo: 'Personal', duracion: '1 dia' },
  { nip: '6724', fechaInicio: '2025-05-26', fechaFin: '2025-05-26', motivo: 'Personal', duracion: '1 dia' },
  { nip: '6015', fechaInicio: '2025-03-14', fechaFin: '2025-03-14', motivo: 'Personal', duracion: '1 dia' },
  { nip: '6015', fechaInicio: '2025-05-30', fechaFin: '2025-05-30', motivo: 'Personal', duracion: '1 dia' },
  { nip: '5693', fechaInicio: '2025-01-31', fechaFin: '2025-01-31', motivo: 'Personal', duracion: '1 dia' },
  { nip: '5693', fechaInicio: '2025-01-16', fechaFin: '2025-01-16', motivo: 'Personal', duracion: '1 dia' },
  { nip: '5693', fechaInicio: '2025-04-24', fechaFin: '2025-04-24', motivo: 'Personal', duracion: '1 dia' },
  { nip: '6498', fechaInicio: '2025-05-06', fechaFin: '2025-05-06', motivo: 'Personal', duracion: '1 dia' },
  { nip: '6498', fechaInicio: '2025-06-06', fechaFin: '2025-06-06', motivo: 'Personal', duracion: '1 dia' },
  { nip: '7886', fechaInicio: '2025-03-12', fechaFin: '2025-03-12', motivo: 'Personal', duracion: '1 dia' },
  { nip: '7886', fechaInicio: '2025-06-30', fechaFin: '2025-06-30', motivo: 'Personal', duracion: '1 dia' },
  { nip: '4750', fechaInicio: '2025-04-21', fechaFin: '2025-04-21', motivo: 'Personal', duracion: '1 dia' },
  { nip: '4750', fechaInicio: '2025-03-07', fechaFin: '2025-03-07', motivo: 'Personal', duracion: '1 dia' },
  { nip: '4750', fechaInicio: '2025-04-03', fechaFin: '2025-04-03', motivo: 'Personal', duracion: '1 dia' },
  { nip: '4750', fechaInicio: '2025-05-08', fechaFin: '2025-05-08', motivo: 'Personal', duracion: '1 dia' },
  { nip: '2179', fechaInicio: '2025-03-10', fechaFin: '2025-03-10', motivo: 'Personal', duracion: '1 dia' },
  { nip: '2179', fechaInicio: '2025-05-13', fechaFin: '2025-05-13', motivo: 'Personal', duracion: '1 dia' },
  { nip: '4357', fechaInicio: '2025-02-10', fechaFin: '2025-02-10', motivo: 'Personal', duracion: '1' },
  { nip: '4357', fechaInicio: '2025-04-07', fechaFin: '2025-04-07', motivo: 'Personal', duracion: '1 dia' },
  { nip: '4357', fechaInicio: '2025-04-10', fechaFin: '2025-04-10', motivo: 'Personal', duracion: '1 dia' },
  { nip: '4357', fechaInicio: '2025-04-02', fechaFin: '2025-04-02', motivo: 'Personal', duracion: '1 dia' },
  { nip: '6724', fechaInicio: '2025-05-27', fechaFin: '2025-05-27', motivo: 'Enfermedad', duracion: 'Salida a las 10:00am' },
  { nip: '4895', fechaInicio: '2025-05-20', fechaFin: '2025-05-20', motivo: 'Personal', duracion: '1 dia' },
  { nip: '4895', fechaInicio: '2025-06-12', fechaFin: '2025-06-12', motivo: 'Personal', duracion: '1 dia' },
  { nip: '9816', fechaInicio: '2025-07-23', fechaFin: '2025-08-01', motivo: 'Viaje planeado antes de entrar a trabajar', duracion: '23/07/2025 - 01/08/2025' },
  { nip: '5393', fechaInicio: '2025-07-17', fechaFin: '2025-07-17', motivo: 'Motivos familiares', duracion: '16:00 - 18:00' },
  { nip: '4928', fechaInicio: '2025-07-18', fechaFin: '2025-07-18', motivo: 'Personal', duracion: '15:30 - 18:00' },
  { nip: '5693', fechaInicio: '2025-07-17', fechaFin: '2025-07-17', motivo: 'FAMILIAR', duracion: '2 HORAS' },
  { nip: '6724', fechaInicio: '2025-07-14', fechaFin: '2025-07-14', motivo: 'FAMILIAR', duracion: '1 HORA Y MEDIA' },
  { nip: '3073', fechaInicio: '2025-07-17', fechaFin: '2025-07-17', motivo: 'PERSONAL', duracion: '45 MIN' },
  { nip: '9568', fechaInicio: '2025-07-18', fechaFin: '2025-07-18', motivo: 'EVENTO FAMILIAR', duracion: '16:00 - 18:00' },
  { nip: '8314', fechaInicio: '2025-07-23', fechaFin: '2025-07-23', motivo: 'Cita medica', duracion: '16:00 - 18:00' },
  { nip: '6724', fechaInicio: '2025-07-24', fechaFin: '2025-07-24', motivo: 'PERSONAL', duracion: '2 HRS 45 MIN' },
  { nip: '7886', fechaInicio: '2025-08-04', fechaFin: '2025-08-04', motivo: 'Foto grupal de graduación', duracion: '13:30 - 18:00' },
  { nip: '6125', fechaInicio: '2025-08-04', fechaFin: '2025-08-04', motivo: 'PERSONAL', duracion: '1 dia' },
  { nip: '5693', fechaInicio: '2025-08-11', fechaFin: '2025-08-11', motivo: 'PERSONAL', duracion: '1 HORA Y MEDIA' },
  { nip: '6523', fechaInicio: '2025-08-09', fechaFin: '2025-08-09', motivo: 'platicas matrimoniales', duracion: '1 dia' },
  { nip: '6821', fechaInicio: '2025-09-13', fechaFin: '2025-09-13', motivo: 'PERSONAL', duracion: '8 HRS' },
  { nip: '9816', fechaInicio: '2025-09-09', fechaFin: '2025-09-09', motivo: 'REALIZACION DE TRAMITES', duracion: '3 HORAS' },
  { nip: '3108', fechaInicio: '2025-10-07', fechaFin: '2025-10-07', motivo: 'Tramites escolares', duracion: '9:00 - 11:00' },
  { nip: '3108', fechaInicio: '2025-09-29', fechaFin: '2025-09-29', motivo: 'PERSONAL', duracion: '25 min' },
  { nip: '5693', fechaInicio: '2025-10-09', fechaFin: '2025-10-09', motivo: 'CITA PARA VISA', duracion: '3 HORAS' },
  { nip: '5693', fechaInicio: '2025-10-15', fechaFin: '2025-10-15', motivo: 'TRAMITES DE VISA', duracion: '3 HORAS' },
  { nip: '8314', fechaInicio: '2025-10-31', fechaFin: '2025-10-31', motivo: 'Compromiso personal', duracion: '15:00 - 18:00' },
  { nip: '8517', fechaInicio: '2025-10-24', fechaFin: '2025-10-24', motivo: 'SALE FUERA DE LA CD', duracion: '8 HRS' },
  { nip: '9625', fechaInicio: '2025-10-20', fechaFin: '2025-10-20', motivo: 'CHOQUE AUTOMOVILISTICO', duracion: '3 HORAS 41 MIN' },
  { nip: '3073', fechaInicio: '2025-11-04', fechaFin: '2025-11-04', motivo: 'FAMILIAR', duracion: '8' },
  { nip: '3073', fechaInicio: '2025-10-31', fechaFin: '2025-10-31', motivo: 'FAMILIAR', duracion: '8' },
  { nip: '9945', fechaInicio: '2025-11-12', fechaFin: '2025-11-12', motivo: 'SALIO FUERA DE LA CD', duracion: '5 HRS' },
  { nip: '8314', fechaInicio: '2025-11-20', fechaFin: '2025-11-20', motivo: 'BOLETA DE SUS HIJOS', duracion: '2 HRS 30 MIN' },
  { nip: '8314', fechaInicio: '2025-11-20', fechaFin: '2025-11-20', motivo: 'Entrega de calificaciones de mis hijos', duracion: '09:00 - 12:00' },
  { nip: '8314', fechaInicio: '2025-11-26', fechaFin: '2025-11-26', motivo: 'CITA MEDICA', duracion: '3 HORAS' },
  { nip: '9945', fechaInicio: '2025-12-16', fechaFin: '2025-12-16', motivo: 'FESTIVAL NAVIDENO', duracion: '3 HORAS' },
  { nip: '5693', fechaInicio: '2025-12-04', fechaFin: '2025-12-04', motivo: 'FAMILIAR', duracion: '1' },
  { nip: '4750', fechaInicio: '2025-12-24', fechaFin: '2025-12-24', motivo: 'FAMILIAR', duracion: '1' },
  { nip: '9945', fechaInicio: '2025-12-26', fechaFin: '2025-12-26', motivo: 'FAMILIAR', duracion: '8 HRS' },
  { nip: '9945', fechaInicio: '2025-12-08', fechaFin: '2025-12-08', motivo: 'festival navideno hijos', duracion: '09:00 - 12:00' },
  { nip: '6125', fechaInicio: '2025-12-08', fechaFin: '2025-12-08', motivo: 'PERSONAL', duracion: '1 HRA 39 MIN' },
  { nip: '3073', fechaInicio: '2025-12-18', fechaFin: '2025-12-18', motivo: 'Festival hijo', duracion: '3 hrs 46 min' },
  { nip: '8517', fechaInicio: '2025-12-30', fechaFin: '2025-12-30', motivo: 'llanta baja', duracion: '47 min' },
  { nip: '3073', fechaInicio: '2026-01-13', fechaFin: '2026-01-14', motivo: 'FALLECIMIENTO DE UN FAMILIAR', duracion: '8 HRS' },
  { nip: '9625', fechaInicio: '2026-01-26', fechaFin: '2026-01-26', motivo: 'PERSONAL', duracion: '1' },
  { nip: '7886', fechaInicio: '2026-02-05', fechaFin: '2026-02-05', motivo: 'PERSONAL', duracion: '2' },
  { nip: '4357', fechaInicio: '2026-02-23', fechaFin: '2026-02-23', motivo: 'PERSONAL', duracion: '2' },
  { nip: '9945', fechaInicio: '2026-02-23', fechaFin: '2026-02-23', motivo: 'PERSONAL', duracion: '4' },
  { nip: '4750', fechaInicio: '2026-03-02', fechaFin: '2026-03-02', motivo: 'PERSONAL', duracion: '2 HRS 40 MIN' },
  { nip: '8517', fechaInicio: '2026-04-28', fechaFin: '2026-05-01', motivo: 'torneo futbol de mi hijo, en vallarta', duracion: '28/04/2026 - 01/05/2026' },
  { nip: '4750', fechaInicio: '2026-03-06', fechaFin: '2026-03-06', motivo: 'PERSONAL', duracion: '2' },
];

// solicitud_vacaciones → Vacacion
const solicitudVacaciones = [
  { nip: '5693', fechaInicio: '2025-07-12', fechaFin: '2025-07-12', dias: 1, aprobada: 1 },
  { nip: '4420', fechaInicio: '2025-08-04', fechaFin: '2025-08-04', dias: 1, aprobada: 1 },
  { nip: '3073', fechaInicio: '2025-07-30', fechaFin: '2025-08-01', dias: 3, aprobada: 1 },
  { nip: '2179', fechaInicio: '2025-08-01', fechaFin: '2025-08-04', dias: 2, aprobada: 1 },
  { nip: '4750', fechaInicio: '2025-08-28', fechaFin: '2025-08-29', dias: 2, aprobada: 1 },
  { nip: '7886', fechaInicio: '2025-07-30', fechaFin: '2025-07-30', dias: 1, aprobada: 1 },
  { nip: '7886', fechaInicio: '2025-07-22', fechaFin: '2025-07-25', dias: 4, aprobada: 1 },
  { nip: '7886', fechaInicio: '2025-07-28', fechaFin: '2025-07-29', dias: 2, aprobada: 1 },
  { nip: '5693', fechaInicio: '2025-07-25', fechaFin: '2025-07-25', dias: 1, aprobada: 1 },
  { nip: '5693', fechaInicio: '2025-08-18', fechaFin: '2025-08-21', dias: 1, aprobada: 1 },
  { nip: '5693', fechaInicio: '2025-08-25', fechaFin: '2025-08-25', dias: 1, aprobada: 1 },
  { nip: '3073', fechaInicio: '2025-08-22', fechaFin: '2025-08-22', dias: 1, aprobada: 1 },
  { nip: '3073', fechaInicio: '2025-09-15', fechaFin: '2025-09-15', dias: 1, aprobada: 1 },
  { nip: '4420', fechaInicio: '2025-09-26', fechaFin: '2025-09-26', dias: 1, aprobada: 1 },
  { nip: '7886', fechaInicio: '2025-09-26', fechaFin: '2025-09-26', dias: 1, aprobada: 1 },
  { nip: '4750', fechaInicio: '2025-09-01', fechaFin: '2025-09-01', dias: 1, aprobada: 1 },
  { nip: '3073', fechaInicio: '2025-09-05', fechaFin: '2025-09-05', dias: 1, aprobada: 1 },
  { nip: '5693', fechaInicio: '2025-10-09', fechaFin: '2025-10-09', dias: 1, aprobada: 2, motivoRechazo: 'SE TOMARA COMO PERMISO YA QUE ES FECHA DE IMPUESTOS' },
  { nip: '5693', fechaInicio: '2025-10-15', fechaFin: '2025-10-15', dias: 1, aprobada: 2, motivoRechazo: 'SE TOMARA COMO PERMISO YA QUE ES DIA DE IMPUESTOS' },
  { nip: '3108', fechaInicio: '2025-10-27', fechaFin: '2025-10-27', dias: 1, aprobada: 1 },
  { nip: '4357', fechaInicio: '2025-10-29', fechaFin: '2025-10-31', dias: 3, aprobada: 1 },
  { nip: '4357', fechaInicio: '2025-11-03', fechaFin: '2025-11-04', dias: 2, aprobada: 1 },
  { nip: '4420', fechaInicio: '2025-10-27', fechaFin: '2025-10-28', dias: 2, aprobada: 1 },
  { nip: '3108', fechaInicio: '2025-10-28', fechaFin: '2025-10-28', dias: 1, aprobada: 1 },
  { nip: '5693', fechaInicio: '2025-11-03', fechaFin: '2025-11-03', dias: 1, aprobada: 1 },
  { nip: '4357', fechaInicio: '2025-11-05', fechaFin: '2025-11-05', dias: 1, aprobada: 1 },
  { nip: '3108', fechaInicio: '2025-12-01', fechaFin: '2025-12-03', dias: 3, aprobada: 1 },
  { nip: '3108', fechaInicio: '2025-12-10', fechaFin: '2025-12-11', dias: 2, aprobada: 1 },
  { nip: '6015', fechaInicio: '2025-12-15', fechaFin: '2025-12-19', dias: 5, aprobada: 1 },
  { nip: '4420', fechaInicio: '2025-12-26', fechaFin: '2025-12-26', dias: 1, aprobada: 1 },
  { nip: '4420', fechaInicio: '2026-01-02', fechaFin: '2026-01-02', dias: 1, aprobada: 1 },
  { nip: '7886', fechaInicio: '2025-12-26', fechaFin: '2025-12-26', dias: 1, aprobada: 1 },
  { nip: '7886', fechaInicio: '2025-12-31', fechaFin: '2025-12-31', dias: 1, aprobada: 1 },
  { nip: '7886', fechaInicio: '2026-01-02', fechaFin: '2026-01-02', dias: 1, aprobada: 1 },
  { nip: '7886', fechaInicio: '2025-12-22', fechaFin: '2025-12-22', dias: 1, aprobada: 1 },
  { nip: '5693', fechaInicio: '2025-12-31', fechaFin: '2026-01-02', dias: 3, aprobada: 1 },
  { nip: '3073', fechaInicio: '2025-12-26', fechaFin: '2025-12-26', dias: 1, aprobada: 1 },
  { nip: '3073', fechaInicio: '2026-01-02', fechaFin: '2026-01-02', dias: 1, aprobada: 1 },
  { nip: '3108', fechaInicio: '2025-12-26', fechaFin: '2025-12-26', dias: 1, aprobada: 1 },
  { nip: '4750', fechaInicio: '2025-12-26', fechaFin: '2025-12-26', dias: 1, aprobada: 1 },
  { nip: '7886', fechaInicio: '2025-12-24', fechaFin: '2025-12-24', dias: 1, aprobada: 1 },
  { nip: '8211', fechaInicio: '2025-12-26', fechaFin: '2025-12-26', dias: 1, aprobada: 1 },
  { nip: '4420', fechaInicio: '2025-12-24', fechaFin: '2025-12-24', dias: 1, aprobada: 1 },
  { nip: '4420', fechaInicio: '2025-12-31', fechaFin: '2025-12-31', dias: 1, aprobada: 1 },
  { nip: '4420', fechaInicio: '2026-01-02', fechaFin: '2026-01-02', dias: 1, aprobada: 1 },
  { nip: '5693', fechaInicio: '2025-12-11', fechaFin: '2025-12-11', dias: 1, aprobada: 1 },
  { nip: '3724', fechaInicio: '2025-12-12', fechaFin: '2025-12-12', dias: 1, aprobada: 1 },
  { nip: '3724', fechaInicio: '2025-12-18', fechaFin: '2025-12-19', dias: 2, aprobada: 1 },
  { nip: '3724', fechaInicio: '2025-12-24', fechaFin: '2025-12-24', dias: 1, aprobada: 1 },
  { nip: '3724', fechaInicio: '2025-12-26', fechaFin: '2025-12-26', dias: 1, aprobada: 1 },
  { nip: '7886', fechaInicio: '2026-02-03', fechaFin: '2026-02-04', dias: 2, aprobada: 1 },
  { nip: '4420', fechaInicio: '2026-03-24', fechaFin: '2026-03-24', dias: 1, aprobada: 0 },
  { nip: '4420', fechaInicio: '2026-04-20', fechaFin: '2026-04-24', dias: 5, aprobada: 0 },
  { nip: '6125', fechaInicio: '2026-03-12', fechaFin: '2026-03-12', dias: 1, aprobada: 1 },
  { nip: '6125', fechaInicio: '2026-03-13', fechaFin: '2026-03-13', dias: 1, aprobada: 1 },
  { nip: '3073', fechaInicio: '2026-03-24', fechaFin: '2026-03-24', dias: 1, aprobada: 1 },
];

// vacaciones_historicas → Vacacion (all approved, historical)
const vacacionesHistoricas = [
  { nip: '8211', dias: 1, fechaInicio: '2024-10-04', fechaFin: '2024-10-04' },
  { nip: '8211', dias: 1, fechaInicio: '2024-10-25', fechaFin: '2024-10-25' },
  { nip: '8211', dias: 1, fechaInicio: '2024-12-31', fechaFin: '2024-12-31' },
  { nip: '8211', dias: 2, fechaInicio: '2025-05-05', fechaFin: '2025-05-06' },
  { nip: '8211', dias: 1, fechaInicio: '2025-07-04', fechaFin: '2025-07-04' },
  { nip: '8211', dias: 1, fechaInicio: '2025-07-21', fechaFin: '2025-07-21' },
  { nip: '8211', dias: 1, fechaInicio: '2025-07-28', fechaFin: '2025-07-28' },
  { nip: '8211', dias: 1, fechaInicio: '2025-08-04', fechaFin: '2025-08-04' },
  { nip: '8211', dias: 1, fechaInicio: '2025-08-11', fechaFin: '2025-08-11' },
  { nip: '8211', dias: 1, fechaInicio: '2025-08-18', fechaFin: '2025-08-18' },
  { nip: '8211', dias: 1, fechaInicio: '2025-08-25', fechaFin: '2025-08-25' },
  { nip: '3108', dias: 1, fechaInicio: '2025-05-02', fechaFin: '2025-05-02' },
  { nip: '3108', dias: 1, fechaInicio: '2025-05-09', fechaFin: '2025-05-09' },
  { nip: '3073', dias: 1, fechaInicio: '2024-12-16', fechaFin: '2024-12-16' },
  { nip: '3073', dias: 1, fechaInicio: '2025-03-24', fechaFin: '2025-03-24' },
  { nip: '3073', dias: 1, fechaInicio: '2025-04-30', fechaFin: '2025-04-30' },
  { nip: '3073', dias: 1, fechaInicio: '2025-05-02', fechaFin: '2025-05-02' },
  { nip: '2179', dias: 1, fechaInicio: '2025-04-21', fechaFin: '2025-04-21' },
  { nip: '2179', dias: 1, fechaInicio: '2025-04-22', fechaFin: '2025-04-22' },
  { nip: '4357', dias: 1, fechaInicio: '2025-04-25', fechaFin: '2025-04-25' },
  { nip: '4420', dias: 1, fechaInicio: '2025-06-03', fechaFin: '2025-06-03' },
  { nip: '4750', dias: 1, fechaInicio: '2025-04-18', fechaFin: '2025-04-18' },
  { nip: '4750', dias: 1, fechaInicio: '2025-04-21', fechaFin: '2025-04-21' },
  { nip: '4750', dias: 5, fechaInicio: '2025-06-23', fechaFin: '2025-06-27' },
  { nip: '5693', dias: 1, fechaInicio: '2025-04-11', fechaFin: '2025-04-11' },
  { nip: '5693', dias: 1, fechaInicio: '2025-05-02', fechaFin: '2025-05-02' },
  { nip: '7886', dias: 1, fechaInicio: '2025-04-18', fechaFin: '2025-04-18' },
];

// =========================
// IMPORT FUNCTIONS
// =========================

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  const firstName = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
  const lastName = parts.slice(Math.ceil(parts.length / 2)).join(' ');
  return { firstName, lastName };
}

function safeDate(dateStr) {
  if (!dateStr) return null;
  // Handle malformed dates like '0005-09-23' or '0006-01-02'
  const year = parseInt(dateStr.substring(0, 4));
  if (year < 1900) return null;
  return new Date(dateStr + 'T00:00:00.000Z');
}

async function main() {
  console.log('=== STARTING DATA IMPORT ===\n');
  
  const defaultPassword = await bcrypt.hash('0102', 10);
  
  // Build NIP → User ID map
  const nipToId = {};
  
  // ---- STEP 1: Create/update users from perfiles_psicometricos ----
  console.log('--- Step 1: Importing users from perfiles_psicometricos ---');
  let created = 0, updated = 0, skipped = 0;
  
  for (const p of perfiles) {
    const { firstName, lastName } = splitName(p.nombre);
    
    // Check if user with this NIP already exists
    const existing = await prisma.user.findUnique({ where: { nip: p.nip } });
    
    const userData = {
      sexo: p.sexo,
      nivelEducativo: p.nivelEducativo,
      area: p.area,
      estadoCivil: p.estadoCivil,
      respuestaMentalidad: p.respuestaMentalidad,
      respuestaComunicacion: p.respuestaComunicacion,
      antiguedadAnios: safeDate(p.antiguedadAnios),
      analisisNumerologia: p.analisisNumerologia,
      fechaNacimiento: safeDate(p.fechaNacimiento),
      diasVacaciones: p.diasVacaciones || 0,
    };
    
    if (existing) {
      // Update existing user with profile data
      await prisma.user.update({
        where: { nip: p.nip },
        data: userData,
      });
      nipToId[p.nip] = existing.id;
      updated++;
      console.log(`  Updated: ${p.nombre} (NIP: ${p.nip})`);
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          username: p.nip,
          nip: p.nip,
          password: defaultPassword,
          email: `${p.nip}@mm.local`,
          firstName,
          lastName,
          isAdmin: p.nip === '9999', // Mauricio is admin
          ...userData,
        },
      });
      nipToId[p.nip] = user.id;
      created++;
      console.log(`  Created: ${p.nombre} (NIP: ${p.nip})`);
    }
  }
  console.log(`  Users from perfiles: ${created} created, ${updated} updated\n`);
  
  // ---- STEP 2: Create missing users from other tables ----
  console.log('--- Step 2: Creating missing users ---');
  let extraCreated = 0;
  
  // Collect all NIPs from all data sources
  const allNips = new Set();
  retardos.forEach(r => allNips.add(r.nip));
  inasistencias.forEach(i => allNips.add(i.nip));
  permisosAdmin.forEach(p => allNips.add(p.nip));
  solicitudVacaciones.forEach(v => allNips.add(v.nip));
  vacacionesHistoricas.forEach(v => allNips.add(v.nip));
  
  for (const nip of allNips) {
    if (nipToId[nip]) continue; // Already exists
    
    const existing = await prisma.user.findUnique({ where: { nip } });
    if (existing) {
      nipToId[nip] = existing.id;
      continue;
    }
    
    // Find name from extraUsers or nameOverrides
    const override = nameOverrides[nip];
    const extra = extraUsers.find(e => e.nip === nip);
    const nombre = override || (extra ? extra.nombre : `Colaborador ${nip}`);
    const { firstName, lastName } = splitName(nombre);
    
    const user = await prisma.user.create({
      data: {
        username: nip,
        nip,
        password: defaultPassword,
        email: `${nip}@mm.local`,
        firstName,
        lastName,
      },
    });
    nipToId[nip] = user.id;
    extraCreated++;
    console.log(`  Created extra user: ${nombre} (NIP: ${nip})`);
  }
  console.log(`  Extra users created: ${extraCreated}\n`);
  
  // ---- STEP 3: Import inasistencias (FALTAS) ----
  console.log('--- Step 3: Importing inasistencias (faltas) ---');
  let faltasCount = 0;
  
  for (const i of inasistencias) {
    const userId = nipToId[i.nip];
    if (!userId) { console.log(`  SKIP falta: NIP ${i.nip} not found`); continue; }
    const fecha = safeDate(i.fecha);
    if (!fecha) continue;
    
    await prisma.incidencia.create({
      data: {
        userId,
        tipo: 'FALTA',
        fecha,
        minutos: 0,
        dias: 1,
        descripcion: i.descripcion || '',
      },
    });
    faltasCount++;
  }
  console.log(`  Faltas imported: ${faltasCount}\n`);
  
  // ---- STEP 4: Import retardos ----
  console.log('--- Step 4: Importing retardos ---');
  let retardosCount = 0;
  
  for (const r of retardos) {
    const userId = nipToId[r.nip];
    if (!userId) { console.log(`  SKIP retardo: NIP ${r.nip} not found`); continue; }
    const fecha = safeDate(r.fecha);
    if (!fecha) continue;
    
    await prisma.incidencia.create({
      data: {
        userId,
        tipo: 'RETARDO',
        fecha,
        minutos: r.minutos || 11, // default 11 minutes if null
        dias: 0,
        descripcion: r.descripcion || '',
      },
    });
    retardosCount++;
  }
  console.log(`  Retardos imported: ${retardosCount}\n`);
  
  // ---- STEP 5: Import permisos (admin-recorded) ----
  console.log('--- Step 5: Importing permisos (admin) ---');
  let permisosCount = 0;
  
  for (const p of permisosAdmin) {
    const userId = nipToId[p.nip];
    if (!userId) { console.log(`  SKIP permiso: NIP ${p.nip} not found`); continue; }
    
    const fechaInicio = safeDate(p.fechaInicio);
    const fechaFin = safeDate(p.fechaFin) || fechaInicio;
    if (!fechaInicio) continue;
    
    const esMismoDia = p.fechaInicio === p.fechaFin;
    
    await prisma.permiso.create({
      data: {
        userId,
        tipoPermiso: p.motivo || 'Personal',
        esMismoDia,
        fechaInicio,
        fechaFin: fechaFin || fechaInicio,
        descripcion: `${p.motivo || 'Personal'} - Duración: ${p.duracion || 'N/A'}`,
        estado: 'APROBADO',
      },
    });
    permisosCount++;
  }
  console.log(`  Permisos (admin) imported: ${permisosCount}\n`);
  
  // ---- STEP 6: Import vacaciones (solicitudes) ----
  console.log('--- Step 6: Importing vacaciones (solicitudes) ---');
  let vacSolCount = 0;
  
  for (const v of solicitudVacaciones) {
    const userId = nipToId[v.nip];
    if (!userId) { console.log(`  SKIP vacacion: NIP ${v.nip} not found`); continue; }
    
    const fechaInicio = safeDate(v.fechaInicio);
    const fechaFin = safeDate(v.fechaFin) || fechaInicio;
    if (!fechaInicio) continue;
    
    let estado;
    if (v.aprobada === 1) estado = 'APROBADO';
    else if (v.aprobada === 2) estado = 'RECHAZADO';
    else estado = 'PENDIENTE';
    
    let descripcion = 'Vacaciones';
    if (v.motivoRechazo) descripcion += ` - Motivo rechazo: ${v.motivoRechazo}`;
    
    await prisma.vacacion.create({
      data: {
        userId,
        fechaInicio,
        fechaFin: fechaFin || fechaInicio,
        diasTotal: v.dias,
        descripcion,
        estado,
      },
    });
    vacSolCount++;
  }
  console.log(`  Vacaciones (solicitudes) imported: ${vacSolCount}\n`);
  
  // ---- STEP 7: Import vacaciones historicas ----
  console.log('--- Step 7: Importing vacaciones históricas ---');
  let vacHistCount = 0;
  
  for (const v of vacacionesHistoricas) {
    const userId = nipToId[v.nip];
    if (!userId) { console.log(`  SKIP vacacion hist: NIP ${v.nip} not found`); continue; }
    
    const fechaInicio = safeDate(v.fechaInicio);
    const fechaFin = safeDate(v.fechaFin) || fechaInicio;
    if (!fechaInicio) continue;
    
    await prisma.vacacion.create({
      data: {
        userId,
        fechaInicio,
        fechaFin: fechaFin || fechaInicio,
        diasTotal: v.dias,
        descripcion: 'Vacaciones históricas',
        estado: 'APROBADO',
      },
    });
    vacHistCount++;
  }
  console.log(`  Vacaciones históricas imported: ${vacHistCount}\n`);
  
  // ---- STEP 8: Update totalRetardos and totalFaltas counters ----
  console.log('--- Step 8: Updating retardos/faltas counters ---');
  
  for (const [nip, userId] of Object.entries(nipToId)) {
    const totalRetardos = await prisma.incidencia.count({
      where: { userId, tipo: 'RETARDO' },
    });
    const totalFaltas = await prisma.incidencia.count({
      where: { userId, tipo: 'FALTA' },
    });
    
    await prisma.user.update({
      where: { id: userId },
      data: { totalRetardos, totalFaltas },
    });
  }
  console.log('  Counters updated!\n');
  
  // ---- SUMMARY ----
  const totalUsers = await prisma.user.count();
  const totalIncidencias = await prisma.incidencia.count();
  const totalPermisos = await prisma.permiso.count();
  const totalVacaciones = await prisma.vacacion.count();
  
  console.log('=== IMPORT COMPLETE ===');
  console.log(`Total users: ${totalUsers}`);
  console.log(`Total incidencias: ${totalIncidencias}`);
  console.log(`Total permisos: ${totalPermisos}`);
  console.log(`Total vacaciones: ${totalVacaciones}`);
}

main()
  .catch((e) => {
    console.error('ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
