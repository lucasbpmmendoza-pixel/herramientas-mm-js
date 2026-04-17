export interface User {
  id: string;
  username: string;
  nip: string;
  email: string;
  firstName: string;
  lastName: string;
  diasVacaciones: number;
  diasVacUsados: number;
  isAdmin: boolean;
  isActive: boolean;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface Permiso {
  id: string;
  userId: string;
  tipoPermiso: string;
  esMismoDia: boolean;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  descripcion: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  createdAt: string;
  updatedAt: string;
}

export interface Vacacion {
  id: string;
  userId: string;
  fechaInicio: string;
  fechaFin: string;
  diasTotal: number;
  descripcion: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  createdAt: string;
  updatedAt: string;
}

export interface Estadistica {
  id: string;
  userId: string;
  metaTrabajo: number;
  horasTrabajadas: number;
  proyectos: number;
  tareasCompletas: number;
  tareasRetrasadas: number;
  calificacion: number;
  mes: number;
  año: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
