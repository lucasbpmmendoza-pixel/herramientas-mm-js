/**
 * Calcula los días de vacaciones a los que tiene derecho un colaborador
 * según la ley federal del trabajo mexicana y política interna:
 *
 * - 1er año: 12 días laborables pagados
 * - Años 2–5: +2 días por cada año subsecuente (hasta 20)
 * - A partir del año 5: +2 días por cada 5 años adicionales de servicio
 *
 * Ejemplos:
 *   1 año  → 12 días
 *   2 años → 14 días
 *   3 años → 16 días
 *   4 años → 18 días
 *   5 años → 20 días
 *  10 años → 22 días
 *  15 años → 24 días
 *  20 años → 26 días
 */
export function calcularDiasVacaciones(antiguedadAnios: string | null | undefined): number {
  if (!antiguedadAnios) return 0; // sin fecha de ingreso registrada

  const inicio = new Date(antiguedadAnios);
  const hoy = new Date();

  let años = hoy.getFullYear() - inicio.getFullYear();
  const mesOffset = hoy.getMonth() - inicio.getMonth();
  if (mesOffset < 0 || (mesOffset === 0 && hoy.getDate() < inicio.getDate())) {
    años--;
  }

  if (años < 1) return 0; // aún no cumple el primer año

  // Años 1 a 5: 12 + 2*(años-1)
  if (años <= 5) return 12 + (años - 1) * 2;

  // A partir del año 5: cada 5 años adicionales +2 días
  const periodos = Math.floor((años - 5) / 5);
  return 20 + periodos * 2;
}

/**
 * Retorna la fecha del último aniversario laboral (inicio del período vacacional actual).
 * Si aún no cumple el primer año, retorna null.
 */
export function getUltimoAniversario(antiguedadAnios: string | Date | null | undefined): Date | null {
  if (!antiguedadAnios) return null;

  const inicio = new Date(antiguedadAnios);
  const hoy = new Date();

  let años = hoy.getFullYear() - inicio.getFullYear();
  const mesOffset = hoy.getMonth() - inicio.getMonth();
  if (mesOffset < 0 || (mesOffset === 0 && hoy.getDate() < inicio.getDate())) {
    años--;
  }

  if (años < 1) return null;

  return new Date(inicio.getFullYear() + años, inicio.getMonth(), inicio.getDate());
}
