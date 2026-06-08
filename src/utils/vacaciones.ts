/**
 * Calcula los dias de vacaciones a los que tiene derecho un colaborador
 * segun la ley federal del trabajo mexicana y politica interna:
 *
 * - 1er año: 12 dias laborables pagados
 * - Años 2–5: +2 dias por cada año subsecuente (hasta 20)
 * - A partir del año 5: +2 dias por cada 5 años adicionales de servicio
 *
 * Ejemplos:
 *   1 año  → 12 dias
 *   2 años → 14 dias
 *   3 años → 16 dias
 *   4 años → 18 dias
 *   5 años → 20 dias
 *  10 años → 22 dias
 *  15 años → 24 dias
 *  20 años → 26 dias
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

  if (años < 1) return 0; // aun no cumple el primer año

  // Años 1 a 5: 12 + 2*(años-1)
  if (años <= 5) return 12 + (años - 1) * 2;

  // A partir del año 5: cada 5 años adicionales +2 dias
  const periodos = Math.floor((años - 5) / 5);
  return 20 + periodos * 2;
}

/**
 * Retorna la fecha del ultimo aniversario laboral (inicio del periodo vacacional actual).
 * Si aun no cumple el primer año, retorna null.
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
