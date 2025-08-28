import { ConsumptionSession, QuantityValue, QuantityAnalytics } from '@/types/consumption';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  isWithinInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns';

export interface SessionFrequencyData {
  period: string;
  sessions: number;
  averagePerPeriod: number;
}

export interface WeeklyAnalytics {
  weeklyAverages: SessionFrequencyData[];
  overallWeeklyAverage: number;
  totalWeeks: number;
  currentWeekSessions: number;
  lastWeekSessions: number;
  weeklyTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface MonthlyAnalytics {
  monthlyAverages: SessionFrequencyData[];
  overallMonthlyAverage: number;
  totalMonths: number;
  currentMonthSessions: number;
  lastMonthSessions: number;
  monthlyTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface FrequencyAnalytics {
  weekly: WeeklyAnalytics;
  monthly: MonthlyAnalytics;
  totalSessions: number;
  firstSessionDate: Date | null;
  lastSessionDate: Date | null;
  activePeriod: number;
}

export class AnalyticsService {
  static calculateFrequencyAnalytics(sessions: ConsumptionSession[]): FrequencyAnalytics {
    if (sessions.length === 0) {
      return {
        weekly: {
          weeklyAverages: [],
          overallWeeklyAverage: 0,
          totalWeeks: 0,
          currentWeekSessions: 0,
          lastWeekSessions: 0,
          weeklyTrend: 'stable',
        },
        monthly: {
          monthlyAverages: [],
          overallMonthlyAverage: 0,
          totalMonths: 0,
          currentMonthSessions: 0,
          lastMonthSessions: 0,
          monthlyTrend: 'stable',
        },
        totalSessions: 0,
        firstSessionDate: null,
        lastSessionDate: null,
        activePeriod: 0,
      };
    }

    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const firstSessionDate = new Date(sortedSessions[0].date);
    const lastSessionDate = new Date(sortedSessions[sortedSessions.length - 1].date);
    const now = new Date();

    const weeklyAnalytics = this.calculateWeeklyAnalytics(sessions, firstSessionDate, now);
    const monthlyAnalytics = this.calculateMonthlyAnalytics(sessions, firstSessionDate, now);

    const activePeriod = Math.ceil(
      (lastSessionDate.getTime() - firstSessionDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      weekly: weeklyAnalytics,
      monthly: monthlyAnalytics,
      totalSessions: sessions.length,
      firstSessionDate,
      lastSessionDate,
      activePeriod,
    };
  }

  private static calculateWeeklyAnalytics(
    sessions: ConsumptionSession[],
    startDate: Date,
    endDate: Date,
  ): WeeklyAnalytics {
    const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
    const weeklyData: SessionFrequencyData[] = [];

    weeks.forEach((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekSessions = sessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
      });

      weeklyData.push({
        period: format(weekStart, 'MMM dd, yyyy'),
        sessions: weekSessions.length,
        averagePerPeriod: weekSessions.length,
      });
    });

    const totalWeeks = weeks.length;
    const overallWeeklyAverage = totalWeeks > 0 ? sessions.length / totalWeeks : 0;

    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 });

    const currentWeekSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return isWithinInterval(sessionDate, { start: currentWeekStart, end: currentWeekEnd });
    }).length;

    const lastWeekSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return isWithinInterval(sessionDate, { start: lastWeekStart, end: lastWeekEnd });
    }).length;

    let weeklyTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (currentWeekSessions > lastWeekSessions) weeklyTrend = 'increasing';
    else if (currentWeekSessions < lastWeekSessions) weeklyTrend = 'decreasing';

    return {
      weeklyAverages: weeklyData,
      overallWeeklyAverage: Math.round(overallWeeklyAverage * 100) / 100,
      totalWeeks,
      currentWeekSessions,
      lastWeekSessions,
      weeklyTrend,
    };
  }

  private static calculateMonthlyAnalytics(
    sessions: ConsumptionSession[],
    startDate: Date,
    endDate: Date,
  ): MonthlyAnalytics {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    const monthlyData: SessionFrequencyData[] = [];

    months.forEach((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const monthSessions = sessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return isWithinInterval(sessionDate, { start: monthStart, end: monthEnd });
      });

      monthlyData.push({
        period: format(monthStart, 'MMM yyyy'),
        sessions: monthSessions.length,
        averagePerPeriod: monthSessions.length,
      });
    });

    const totalMonths = months.length;
    const overallMonthlyAverage = totalMonths > 0 ? sessions.length / totalMonths : 0;

    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    const lastMonthStart = startOfMonth(new Date(new Date().getFullYear(), new Date().getMonth() - 1));
    const lastMonthEnd = endOfMonth(new Date(new Date().getFullYear(), new Date().getMonth() - 1));

    const currentMonthSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return isWithinInterval(sessionDate, { start: currentMonthStart, end: currentMonthEnd });
    }).length;

    const lastMonthSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return isWithinInterval(sessionDate, { start: lastMonthStart, end: lastMonthEnd });
    }).length;

    let monthlyTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (currentMonthSessions > lastMonthSessions) monthlyTrend = 'increasing';
    else if (currentMonthSessions < lastMonthSessions) monthlyTrend = 'decreasing';

    return {
      monthlyAverages: monthlyData,
      overallMonthlyAverage: Math.round(overallMonthlyAverage * 100) / 100,
      totalMonths,
      currentMonthSessions,
      lastMonthSessions,
      monthlyTrend,
    };
  }

  static getRecentWeeklyTrend(sessions: ConsumptionSession[], weeksBack = 12): SessionFrequencyData[] {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - weeksBack * 7 * 24 * 60 * 60 * 1000);
    const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekSessions = sessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
      });
      return { period: format(weekStart, 'MMM dd'), sessions: weekSessions.length, averagePerPeriod: weekSessions.length };
    });
  }

  static getRecentMonthlyTrend(sessions: ConsumptionSession[], monthsBack = 12): SessionFrequencyData[] {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - monthsBack, 1);
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const monthSessions = sessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return isWithinInterval(sessionDate, { start: monthStart, end: monthEnd });
      });
      return { period: format(monthStart, 'MMM yyyy'), sessions: monthSessions.length, averagePerPeriod: monthSessions.length };
    });
  }

  static calculateStreaksAndGaps(sessions: ConsumptionSession[]): { currentStreak: number; longestStreak: number; longestGap: number; averageGap: number } {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0, longestGap: 0, averageGap: 0 };
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const uniqueDates = [...new Set(sortedSessions.map((s) => s.date))].sort();
    if (uniqueDates.length <= 1) return { currentStreak: uniqueDates.length, longestStreak: uniqueDates.length, longestGap: 0, averageGap: 0 };
    const gaps: number[] = [];
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const previousDate = new Date(uniqueDates[i - 1]);
      const daysDiff = Math.ceil((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      gaps.push(daysDiff);
      if (daysDiff === 1) tempStreak++;
      else { longestStreak = Math.max(longestStreak, tempStreak); tempStreak = 1; }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    const today = new Date().toISOString().split('T')[0];
    const mostRecentDate = uniqueDates[uniqueDates.length - 1];
    let currentStreak = 0;
    const daysSinceLastSession = Math.ceil((new Date(today).getTime() - new Date(mostRecentDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastSession <= 1) {
      currentStreak = 1;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const currentDate = new Date(uniqueDates[i + 1]);
        const previousDate = new Date(uniqueDates[i]);
        const daysDiff = Math.ceil((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) currentStreak++;
        else break;
      }
    }
    const longestGap = gaps.length > 0 ? Math.max(...gaps) : 0;
    const averageGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
    return { currentStreak, longestStreak, longestGap, averageGap: Math.round(averageGap * 100) / 100 };
  }

  static calculateQuantityAnalytics(sessions: ConsumptionSession[]): QuantityAnalytics {
    if (sessions.length === 0) return { totalQuantityByVessel: {}, averageQuantityByVessel: {}, quantityTrendOverTime: [], mostConsumedStrains: [], quantityEfficiency: { averagePerSession: 0, mostEfficientVessel: '', quantityPerWeek: 0 } };
    const vesselQuantities: Record<string, { total: number; count: number }> = {};
    const strainQuantities: Record<string, number> = {};
    sessions.forEach((session) => {
      const quantity = this.normalizeQuantity(session);
      if (!vesselQuantities[session.vessel]) vesselQuantities[session.vessel] = { total: 0, count: 0 };
      vesselQuantities[session.vessel].total += quantity;
      vesselQuantities[session.vessel].count += 1;
      strainQuantities[session.strain_name] = (strainQuantities[session.strain_name] || 0) + quantity;
    });
    const totalQuantityByVessel: Record<string, number> = {};
    const averageQuantityByVessel: Record<string, number> = {};
    Object.entries(vesselQuantities).forEach(([vessel, data]) => {
      totalQuantityByVessel[vessel] = Math.round(data.total * 100) / 100;
      averageQuantityByVessel[vessel] = Math.round((data.total / data.count) * 100) / 100;
    });
    const mostConsumedStrains = Object.entries(strainQuantities)
      .map(([strain, quantity]) => ({ strain, totalQuantity: Math.round(quantity * 100) / 100 }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
    const quantityTrendOverTime = this.getRecentWeeklyQuantityTrend(sessions, 12);
    const totalQuantity = sessions.reduce((sum, session) => sum + this.normalizeQuantity(session), 0);
    const averagePerSession = Math.round((totalQuantity / sessions.length) * 100) / 100;
    const mostEfficientVessel = Object.entries(averageQuantityByVessel).sort(([, a], [, b]) => b - a)[0]?.[0] || '';
    const weeksSinceFirst = this.getWeeksSinceFirstSession(sessions);
    const quantityPerWeek = weeksSinceFirst > 0 ? Math.round((totalQuantity / weeksSinceFirst) * 100) / 100 : 0;
    return { totalQuantityByVessel, averageQuantityByVessel, quantityTrendOverTime, mostConsumedStrains, quantityEfficiency: { averagePerSession, mostEfficientVessel, quantityPerWeek } };
  }

  private static normalizeQuantity(session: ConsumptionSession): number {
    if (typeof (session as ConsumptionSession & { quantity: number }).quantity === 'number') return (session as ConsumptionSession & { quantity: number }).quantity;
    if (session.quantity && typeof session.quantity === 'object') return (session.quantity as QuantityValue).amount;
    return 0;
  }

  static getRecentWeeklyQuantityTrend(
    sessions: ConsumptionSession[],
    weeksBack = 12,
  ): Array<{ period: string; totalQuantity: number; averageQuantity: number; sessions: number }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - weeksBack * 7 * 24 * 60 * 60 * 1000);
    const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekSessions = sessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
      });
      const totalQuantity = weekSessions.reduce((sum, session) => sum + this.normalizeQuantity(session), 0);
      const averageQuantity = weekSessions.length > 0 ? totalQuantity / weekSessions.length : 0;
      return { period: format(weekStart, 'MMM dd'), totalQuantity: Math.round(totalQuantity * 100) / 100, averageQuantity: Math.round(averageQuantity * 100) / 100, sessions: weekSessions.length };
    });
  }

  private static getWeeksSinceFirstSession(sessions: ConsumptionSession[]): number {
    if (sessions.length === 0) return 0;
    const sorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = new Date(sorted[0].date);
    const now = new Date();
    return Math.max(1, Math.ceil((now.getTime() - first.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  }
}
