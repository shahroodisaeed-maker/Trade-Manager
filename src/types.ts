/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TradeLog {
  id: string;
  dateTime: string; // ISO string or YYYY-MM-DDTHH:mm
  timeframe: string; // e.g. "M1", "M5", "M15", "H1", "H4", "D1"
  strategy: string;
  pair: string; // e.g. "EURUSD", "GBPUSD"
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  image?: string; // base64 representation of uploaded image
  result: 'profit' | 'loss' | 'breakeven';
  gainLossAmount: number; // profit/loss in dollars or units
  notes: string;
}

export interface PositionCalculator {
  balance: number;
  riskPercent: number;
  stopLossPips: number;
  pair: string;
}

export interface ExpenseIncomeItem {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
}

export interface AssetRecord {
  id: string;
  name: string; // e.g., "طلای آب‌شده", "بورس", "ارز دیجیتال"
  value: number; // Current value
  date: string; // YYYY-MM-DD
}

export interface AssetHistory {
  date: string;
  totalValue: number;
}

export interface LoanItem {
  id: string;
  title: string;
  amount: number;
  installmentsCount: number;
  installmentsPaid: number;
  monthlyPaymentDay: number; // Day of the month to settle, 1-31
  monthlyPaymentAmount: number;
  notes: string;
}

export interface DebtClaimItem {
  id: string;
  type: 'debt' | 'claim'; // debt = بدهی (what I owe), claim = طلب (what others owe me)
  person: string;
  amount: number;
  notes: string;
  date: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  streak: number;
  history: { [date: string]: boolean }; // YYYY-MM-DD -> completed or not
  time?: string; // HH:MM scheduled time
  deadlineTime?: string; // HH:MM limit on that day
  hasAlarm?: boolean;
  alarmType?: 'math' | 'normal' | 'notification' | 'none';
}

export interface DayTask {
  id: string;
  title: string;
  day: 'today' | 'tomorrow';
  time?: string; // HH:MM
  hasAlarm: boolean;
  alarmType?: 'math' | 'normal' | 'notification' | 'none';
  isAlarmTriggered?: boolean;
  deadlineTime?: string; // HH:MM limit on that day
  completed: boolean;
  missed: boolean; // Marked with cross if deadline passes
  createdAt: string;
}

export interface GeneralReminder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  completed: boolean;
}

export interface StickyIdea {
  id: string;
  title: string;
  estimatedHours: number;
  description: string;
  status: 'idea' | 'running' | 'completed' | 'later';
  elapsedSeconds: number;
  isRunning: boolean;
  lastStartedAt?: string; // ISO string
}

export interface GameItem {
  id: string;
  title: string;
  status: 'completed_achievements' | 'completed_no_achievements' | 'incomplete' | 'unplayed';
  notes: string;
}

export interface SerialMovieItem {
  id: string;
  title: string;
  status: 'watched' | 'incomplete' | 'unwatched';
  notes: string;
}
