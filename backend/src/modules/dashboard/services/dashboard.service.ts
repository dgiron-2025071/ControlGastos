import { pool } from "../../../config/database";

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export class DashboardService {
  async getDashboard(userId: number, year: number, month: number) {
    const [summary, chart, pending, subscriptions] = await Promise.all([
      this.getSummary(userId, year, month),
      this.getChartData(userId, year, month),
      this.getPending(userId),
      this.getSubscriptions(userId),
    ]);

    return { summary, chart, pending, subscriptions };
  }

  private async getSummary(userId: number, year: number, month: number) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const activosResult = await pool.query(
      `SELECT COALESCE(SUM(monto), 0)::numeric AS total
       FROM activos WHERE user_id = $1`,
      [userId]
    );

    const pasivosResult = await pool.query(
      `SELECT COALESCE(SUM(monto), 0)::numeric AS total
       FROM pasivos WHERE user_id = $1 AND estado = 'ACTIVO'`,
      [userId]
    );

    const monthIngresosResult = await pool.query(
      `SELECT COALESCE(SUM(monto), 0)::numeric AS total
       FROM movimientos
       WHERE user_id = $1 AND tipo = 'INGRESO'
         AND fecha >= $2 AND fecha <= $3`,
      [userId, monthStart, monthEnd]
    );

    const monthGastosResult = await pool.query(
      `SELECT COALESCE(SUM(monto), 0)::numeric AS total
       FROM movimientos
       WHERE user_id = $1 AND tipo = 'GASTO'
         AND fecha >= $2 AND fecha <= $3`,
      [userId, monthStart, monthEnd]
    );

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthStart = new Date(prevYear, prevMonth - 1, 1);
    const prevMonthEnd = new Date(prevYear, prevMonth, 0);

    const prevIngresosResult = await pool.query(
      `SELECT COALESCE(SUM(monto), 0)::numeric AS total
       FROM movimientos
       WHERE user_id = $1 AND tipo = 'INGRESO'
         AND fecha >= $2 AND fecha <= $3`,
      [userId, prevMonthStart, prevMonthEnd]
    );

    const prevGastosResult = await pool.query(
      `SELECT COALESCE(SUM(monto), 0)::numeric AS total
       FROM movimientos
       WHERE user_id = $1 AND tipo = 'GASTO'
         AND fecha >= $2 AND fecha <= $3`,
      [userId, prevMonthStart, prevMonthEnd]
    );

    const totalActivos = Number(activosResult.rows[0].total);
    const totalPasivos = Number(pasivosResult.rows[0].total);
    const monthIngresos = Number(monthIngresosResult.rows[0].total);
    const monthGastos = Number(monthGastosResult.rows[0].total);
    const monthBalance = monthIngresos - monthGastos;

    const prevIngresos = Number(prevIngresosResult.rows[0].total);
    const prevGastos = Number(prevGastosResult.rows[0].total);
    const prevBalance = prevIngresos - prevGastos;

    let percentChange = 0;
    if (prevBalance !== 0) {
      percentChange = ((monthBalance - prevBalance) / Math.abs(prevBalance)) * 100;
    } else if (monthBalance !== 0) {
      percentChange = 100;
    }

    return {
      totalBalance: totalActivos - totalPasivos,
      totalActivos,
      totalPasivos,
      monthBalance,
      percentChange: Math.round(percentChange * 10) / 10,
    };
  }

  private async getChartData(userId: number, year: number, month: number) {
    const points: { month: string; year: number; monthNum: number; ingresos: number; gastos: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      let m = month - i;
      let y = year;
      while (m <= 0) { m += 12; y--; }

      const monthStart = new Date(y, m - 1, 1);
      const monthEnd = new Date(y, m, 0);

      const ingresosResult = await pool.query(
        `SELECT COALESCE(SUM(monto), 0)::numeric AS total
         FROM movimientos
         WHERE user_id = $1 AND tipo = 'INGRESO'
           AND fecha >= $2 AND fecha <= $3`,
        [userId, monthStart, monthEnd]
      );

      const gastosResult = await pool.query(
        `SELECT COALESCE(SUM(monto), 0)::numeric AS total
         FROM movimientos
         WHERE user_id = $1 AND tipo = 'GASTO'
           AND fecha >= $2 AND fecha <= $3`,
        [userId, monthStart, monthEnd]
      );

      points.push({
        month: MONTH_NAMES[m - 1],
        year: y,
        monthNum: m,
        ingresos: Number(ingresosResult.rows[0].total),
        gastos: Number(gastosResult.rows[0].total),
      });
    }

    return points;
  }

  private async getPending(userId: number) {
    const result = await pool.query(
      `SELECT id, nombre, monto, fecha_vencimiento,
              (fecha_vencimiento - CURRENT_DATE)::int AS dias_restantes
       FROM pendientes
       WHERE user_id = $1 AND estado = 'PENDIENTE' AND fecha_vencimiento >= CURRENT_DATE
       ORDER BY fecha_vencimiento ASC
       LIMIT 5`,
      [userId]
    );

    return result.rows.map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      monto: Number(r.monto),
      fechaVencimiento: r.fecha_vencimiento,
      diasRestantes: r.dias_restantes,
    }));
  }

  private async getSubscriptions(userId: number) {
    const result = await pool.query(
      `SELECT id, nombre, monto, proxima_renovacion,
              (proxima_renovacion - CURRENT_DATE)::int AS dias_restantes
       FROM suscripciones
       WHERE user_id = $1 AND estado = 'ACTIVA' AND proxima_renovacion >= CURRENT_DATE
       ORDER BY proxima_renovacion ASC
       LIMIT 5`,
      [userId]
    );

    return result.rows.map((r: any) => ({
      id: r.id,
      nombre: r.nombre,
      monto: Number(r.monto),
      proximaRenovacion: r.proxima_renovacion,
      diasRestantes: r.dias_restantes,
    }));
  }
}

export const dashboardService = new DashboardService();
