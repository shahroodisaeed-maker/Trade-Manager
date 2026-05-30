import React, { useState } from 'react';
import { ExpenseIncomeItem, AssetRecord, LoanItem, DebtClaimItem } from '../types';
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, 
  Plus, Trash2, Calendar, User, FileText, Percent, 
  Check, Award, AlertCircle, HelpCircle, ArrowRight, Edit3
} from 'lucide-react';

interface FinancialSectionProps {
  transactions: ExpenseIncomeItem[];
  assets: AssetRecord[];
  loans: LoanItem[];
  debtClaims: DebtClaimItem[];
  onAddTransaction: (item: Omit<ExpenseIncomeItem, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddAsset: (item: Omit<AssetRecord, 'id'>) => void;
  onUpdateAsset?: (id: string, updates: Partial<AssetRecord>) => void;
  onDeleteAsset: (id: string) => void;
  onAddLoan: (item: Omit<LoanItem, 'id'>) => void;
  onPayLoanInstallment: (id: string) => void;
  onDeleteLoan: (id: string) => void;
  onAddDebtClaim: (item: Omit<DebtClaimItem, 'id'>) => void;
  onDeleteDebtClaim: (id: string) => void;
  darkMode?: boolean;
}

export default function FinancialSection({
  transactions,
  assets,
  loans,
  debtClaims,
  onAddTransaction,
  onDeleteTransaction,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onAddLoan,
  onPayLoanInstallment,
  onDeleteLoan,
  onAddDebtClaim,
  onDeleteDebtClaim,
  darkMode = false
}: FinancialSectionProps) {
  // States – Transactions Tracker
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('دیگر هزینه‌ها');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));

  // States – Assets Tracker
  const [assetName, setAssetName] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [assetDate, setAssetDate] = useState(new Date().toISOString().slice(0, 10));

  // Asset Editing states
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingAssetVal, setEditingAssetVal] = useState('');

  // States – Loans Selector
  const [loanTitle, setLoanTitle] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanInstallments, setLoanInstallments] = useState('12');
  const [loanPayDay, setLoanPayDay] = useState('5');
  const [loanNotes, setLoanNotes] = useState('');

  // States – Debts and Claims Selector
  const [dcType, setDcType] = useState<'debt' | 'claim'>('debt');
  const [dcPerson, setDcPerson] = useState('');
  const [dcAmount, setDcAmount] = useState('');
  const [dcNotes, setDcNotes] = useState('');

  // Analytics Selection State
  const [selectedAnalysisMonth, setSelectedAnalysisMonth] = useState('2026-05');

  // Dropdown options
  const expenseCategories = ['مسکن و اجاره', 'خوراک و معیشت', 'اموزش و توسعه', 'تردد و حمل‌و‌نقل', 'تفریح و سرگرمی', 'درمان و سلامت', 'تجارت و سرمایه', 'دیگر هزینه‌ها'];
  const incomeCategories = ['حقوق دریافتی', 'سود معامله‌گری', 'سرمایه‌گذاری', 'پروژه‌های جانبی', 'دیگر درامدها'];

  // Handle asset editing
  const handleStartAssetEdit = (id: string, currentValue: number) => {
    setEditingAssetId(id);
    setEditingAssetVal(currentValue.toString());
  };

  const handleSaveAssetEdit = (id: string) => {
    if (onUpdateAsset && editingAssetVal) {
      onUpdateAsset(id, { value: Number(editingAssetVal) });
    }
    setEditingAssetId(null);
  };

  // Handle transaction addition
  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount || !txCategory) return;
    onAddTransaction({
      type: txType,
      title: txTitle.trim(),
      amount: Number(txAmount),
      category: txCategory,
      date: txDate
    });
    setTxTitle('');
    setTxAmount('');
  };

  // Handle asset addition
  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !assetValue) return;
    onAddAsset({
      name: assetName.trim(),
      value: Number(assetValue),
      date: assetDate
    });
    setAssetName('');
    setAssetValue('');
  };

  // Handle loan addition
  const handleAddLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanTitle.trim() || !loanAmount) return;
    const count = Number(loanInstallments) || 12;
    const totalVal = Number(loanAmount);
    onAddLoan({
      title: loanTitle.trim(),
      amount: totalVal,
      installmentsCount: count,
      installmentsPaid: 0,
      monthlyPaymentDay: Number(loanPayDay) || 5,
      monthlyPaymentAmount: Math.round(totalVal / count),
      notes: loanNotes.trim()
    });
    setLoanTitle('');
    setLoanAmount('');
    setLoanNotes('');
  };

  // Handle debt / claim addition
  const handleAddDebtClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dcPerson.trim() || !dcAmount) return;
    onAddDebtClaim({
      type: dcType,
      person: dcPerson.trim(),
      amount: Number(dcAmount),
      notes: dcNotes.trim(),
      date: new Date().toISOString().slice(0, 10)
    });
    setDcPerson('');
    setDcAmount('');
    setDcNotes('');
  };

  // Compute values
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const currentNetCashFlow = totalIncome - totalExpense;

  const totalAssetsValue = assets.reduce((acc, a) => acc + a.value, 0);
  const totalDebts = debtClaims.filter(c => c.type === 'debt').reduce((acc, c) => acc + c.amount, 0);
  const totalClaims = debtClaims.filter(c => c.type === 'claim').reduce((acc, c) => acc + c.amount, 0);

  // Compute monthly profit/loss dynamics
  const getMonthlyPerformanceData = () => {
    // Parse the active selectedAnalysisMonth
    const [year, month] = selectedAnalysisMonth.split('-').map(Number);
    
    // Filter transactions
    const monthIncome = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(selectedAnalysisMonth))
      .reduce((acc, t) => acc + t.amount, 0);
      
    const monthExpense = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(selectedAnalysisMonth))
      .reduce((acc, t) => acc + t.amount, 0);
      
    const monthBalance = monthIncome - monthExpense;

    // Prior Month calculation
    const prevMonthNum = month === 1 ? 12 : month - 1;
    const prevYearNum = month === 1 ? year - 1 : year;
    const prevMonthStr = `${prevYearNum}-${prevMonthNum.toString().padStart(2, '0')}`;

    const prevIncome = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(prevMonthStr))
      .reduce((acc, t) => acc + t.amount, 0);

    const prevExpense = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(prevMonthStr))
      .reduce((acc, t) => acc + t.amount, 0);

    const prevBalance = prevIncome - prevExpense;

    return {
      income: monthIncome,
      expense: monthExpense,
      balance: monthBalance,
      prevIncome,
      prevExpense,
      prevBalance,
      prevMonthStr
    };
  };

  const ana = getMonthlyPerformanceData();

  // Calculate weekly portfolio history dynamically based on Saturday aggregation
  const getWeeklyPortfolioHistory = () => {
    const dates: string[] = [];
    const today = new Date();
    
    // Find the nearest Saturday (0: Sunday, ..., 6: Saturday)
    const currentDay = today.getDay();
    const daysToSubtract = (currentDay - 6 + 7) % 7;
    const lastSaturday = new Date(today);
    lastSaturday.setDate(today.getDate() - daysToSubtract);
    
    // Generate the last 52 Saturdays (1 year)
    for (let i = 0; i < 52; i++) {
      const sat = new Date(lastSaturday);
      sat.setDate(lastSaturday.getDate() - i * 7);
      dates.push(sat.toISOString().slice(0, 10));
    }
    
    // Chronological order (oldest first)
    const sortedSaturdays = dates.reverse();
    
    // Calculate total assets value on or before each Saturday
    const history = sortedSaturdays.map(satDate => {
      const totalVal = assets
        .filter(asset => asset.date <= satDate)
        .reduce((sum, asset) => sum + asset.value, 0);
      return {
        date: satDate,
        value: totalVal
      };
    });
    
    // Find when the first asset entered the portfolio so we don't draw leading zeros
    const firstNonZeroIdx = history.findIndex(h => h.value > 0);
    const validHistory = firstNonZeroIdx !== -1 ? history.slice(firstNonZeroIdx) : [];
    
    // Only display latest 30 weeks on the active chart
    const activeData = validHistory.slice(-30);
    // Older weeks are sent to archive
    const archivedData = validHistory.length > 30 ? validHistory.slice(0, validHistory.length - 30) : [];
    
    return {
      activeData,
      archivedData
    };
  };

  // Group assets for charting
  const renderAssetGrowthChart = () => {
    const { activeData, archivedData } = getWeeklyPortfolioHistory();

    if (activeData.length < 2) {
      const currentSum = assets.reduce((acc, a) => acc + a.value, 0);
      return (
        <div className={`h-48 flex flex-col items-center justify-center border border-dashed rounded-2xl text-center p-6 ${
          darkMode ? 'border-slate-800 text-slate-500 bg-slate-900/30' : 'border-slate-200 text-slate-400 bg-slate-50/20'
        }`}>
          <TrendingUp className="mb-2 text-indigo-400 animate-pulse" size={28} />
          {assets.length === 0 ? (
            <span className="font-semibold text-xs leading-relaxed text-slate-500 max-w-sm">
              دارایی‌های سرمایه‌گذاری خود (طلا، بورس، موجودی بانکی، رمز ارز ...) را در فرم بالا یا جدول ثبت کنید تا برآیند کل سبد محاسباتی به صورت خودکار هر شنبه روی نمودار بیاید.
            </span>
          ) : (
            <div className="space-y-1">
              <div className="font-extrabold text-xs text-indigo-400">پورتفوی با موفقیت شناسایی شد!</div>
              <div className="font-bold text-sm text-slate-350">{currentSum.toLocaleString()} تومان</div>
              <div className="text-[10px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                مجموع کلاهای سرمایه‌گذاری جاری شما محاسبه گردید. نمودار پورتفوی شنبه هر هفته رسم می‌شود. برای شروع نمایش نمودار، حداقل باید در ۲ هفته مجزا دارایی ثبت شده داشته باشید.
              </div>
            </div>
          )}
        </div>
      );
    }

    const maxVal = Math.max(...activeData.map(a => a.value));
    const minVal = Math.min(...activeData.map(a => a.value)) * 0.95;
    const range = maxVal - minVal || 1;

    const width = 540;
    const height = 180;
    const pointsList = activeData.map((dataPoint, i) => {
      const x = 35 + i * ((width - 70) / (activeData.length - 1));
      const y = height - 42 - ((dataPoint.value - minVal) / range) * (height - 80);
      return { x, y, value: dataPoint.value, date: dataPoint.date };
    });

    const points = pointsList.map(p => `${p.x},${p.y}`).join(' ');
    const areaPoints = `${pointsList[0].x},${height - 35} ${points} ${pointsList[pointsList.length - 1].x},${height - 35}`;

    return (
      <div className={`p-5 rounded-2xl border relative flex flex-col items-stretch justify-between transition-all ${
        darkMode ? 'bg-slate-950 border-slate-850 shadow-inner' : 'bg-white border-zinc-150 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" /> روند ارزش کل سبد سرمایه‌گذاری (پورتفوی هفتگی - ۳۰ هفته اخیر)
          </span>
          <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">محاسبه خودکار شنبه‌ها</span>
        </div>

        <div className="relative w-full overflow-x-auto pr-1" dir="ltr">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-48 overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Guide Lines */}
            <line x1="20" y1={30} x2={width - 20} y2={30} stroke={darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
            <line x1="20" y1={75} x2={width - 20} y2={75} stroke={darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
            <line x1="20" y1={120} x2={width - 20} y2={120} stroke={darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />

            {/* Shaded Area */}
            <polygon
              points={areaPoints}
              fill="url(#chartGradient)"
            />

            {/* Polyline */}
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              points={points}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Node Info visible on chart */}
            {pointsList.map((p, i) => (
              <g key={i}>
                <line 
                  x1={p.x} 
                  y1={p.y} 
                  x2={p.x} 
                  y2={height - 32} 
                  stroke={darkMode ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.06)"} 
                  strokeDasharray="2,2" 
                />

                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  className="fill-indigo-600 stroke-white hover:r-4.5 transition-all cursor-pointer"
                />

                {/* Show values of dot dynamically to avoid over-cluttering */}
                {(i % Math.ceil(activeData.length / 5) === 0 || i === activeData.length - 1) && (
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className={`text-[8px] font-bold font-mono ${
                      darkMode ? 'fill-indigo-300' : 'fill-indigo-750'
                    }`}
                  >
                    {(p.value / 1000000).toFixed(1)} م
                  </text>
                )}

                {/* Display dates dynamically */}
                {(i % Math.ceil(activeData.length / 5) === 0 || i === activeData.length - 1) && (
                  <text
                    x={p.x}
                    y={height - 18}
                    textAnchor="middle"
                    className="text-[7.5px] font-sans font-semibold text-slate-450"
                  >
                    {p.date}
                  </text>
                )}
              </g>
            ))}

            <line x1="20" y1={height - 32} x2={width - 20} y2={height - 32} stroke={darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"} />
          </svg>
        </div>

        {/* Render archived semanas list under the chart if they exist */}
        {archivedData.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100/10 text-xs">
            <details className="cursor-pointer group">
              <summary className="text-[10px] text-slate-400 font-bold hover:text-indigo-400 flex items-center justify-between">
                <span>📦 نمایش بایگانی پورتفوی در گذشته ({archivedData.length} هفته قدیمی‌تر)</span>
                <span className="text-[9px] text-indigo-400 font-medium">مشاهده آرشیو</span>
              </summary>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 pt-2 transition-all">
                {archivedData.slice().reverse().map((arch, idx) => (
                  <div key={idx} className={`p-2 rounded-xl text-[9px] font-mono flex justify-between items-center ${
                    darkMode ? 'bg-slate-900/60 border border-slate-800' : 'bg-slate-50 border border-slate-100'
                  }`}>
                    <span className="text-slate-500">{arch.date}</span>
                    <span className={`font-bold ${darkMode ? 'text-indigo-405' : 'text-indigo-650'}`}>{arch.value.toLocaleString()} ت</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Financial high level metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 border rounded-2xl flex items-center justify-between shadow-sm transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs text-slate-500 font-medium">ذخیره نقدی (گردش کل)</span>
            <h3 className={`text-xl font-bold mt-1 font-mono tracking-tight ${
              currentNetCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              {currentNetCashFlow.toLocaleString()} تومان
            </h3>
            <div className="text-[9px] text-slate-400 mt-0.5" dir="ltr">
              In: +{totalIncome.toLocaleString()} | Out: -{totalExpense.toLocaleString()}
            </div>
          </div>
          <DollarSign className="text-emerald-500" size={24} />
        </div>

        <div className={`p-4 border rounded-2xl flex items-center justify-between shadow-sm transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs text-slate-500 font-medium">سرمایه انباشته کلاس‌های دارایی</span>
            <h3 className="text-xl font-bold mt-1 font-mono tracking-tight text-indigo-500">
              {totalAssetsValue.toLocaleString()} تومان
            </h3>
            <span className="text-[9px] text-slate-400 block mt-0.5">شامل طلای خام، بورس و سپرده‌های مالی</span>
          </div>
          <TrendingUp className="text-indigo-500" size={24} />
        </div>

        <div className={`p-4 border rounded-2xl flex items-center justify-between shadow-sm transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs text-slate-500 font-medium">مجموع دیون به دیگران (Debts)</span>
            <h3 className="text-xl font-bold mt-1 font-mono tracking-tight text-orange-500">
              {totalDebts.toLocaleString()} تومان
            </h3>
            <span className="text-[9px] text-slate-400 block mt-0.5">بدهی معوق به بستگان و بازار تصفیه‌نشده</span>
          </div>
          <ArrowDownRight className="text-orange-500" size={24} />
        </div>

        <div className={`p-4 border rounded-2xl flex items-center justify-between shadow-sm transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs text-slate-500 font-medium">مطالبات از بستگان و همکاران</span>
            <h3 className="text-xl font-bold mt-1 font-mono tracking-tight text-indigo-650">
              {totalClaims.toLocaleString()} تومان
            </h3>
            <span className="text-[9px] text-slate-400 block mt-0.5 font-sans">پول‌های قرضی و دستمزدهای طراحی شده</span>
          </div>
          <ArrowUpRight className="text-indigo-500" size={24} />
        </div>
      </div>

      {/* Monthly Finance Balance Analyzer - requested by User to verify positive/negative income past month */}
      <div className={`p-5 border rounded-2xl shadow-sm space-y-4 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-zinc-150'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-indigo-100/10 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-bold font-display flex items-center gap-1.5">
              <Percent size={16} className="text-indigo-400 animate-pulse" /> آنالیزور تراز تجمعی سوددهی و درآمد ماهیانه
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">تراز خالص جریان ورودی و خروجی سرمایه‌ای خود را در ماه‌های گذشته به صورت زنده ارزیابی کنید</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-450 font-bold">انتخاب ماه جهت تحلیل:</span>
            <select
              value={selectedAnalysisMonth}
              onChange={(e) => setSelectedAnalysisMonth(e.target.value)}
              className={`text-[10px] font-bold p-1 border-b focus:outline-none rounded ${
                darkMode ? 'text-indigo-300 border-slate-700 bg-slate-950' : 'text-slate-850 border-zinc-200 bg-zinc-50'
              }`}
            >
              <option value="2026-12">آذر ۱۴۰۵ (December 2026)</option>
              <option value="2026-11">آبان ۱۴۰۵ (November 2026)</option>
              <option value="2026-10">مهر ۱۴۰۵ (October 2026)</option>
              <option value="2026-09">شهریور ۱۴۰۵ (September 2026)</option>
              <option value="2026-08">مرداد ۱۴۰۵ (August 2026)</option>
              <option value="2026-07">تیر ۱۴۰۵ (July 2026)</option>
              <option value="2026-06">خرداد ۱۴۰۵ (June 2026)</option>
              <option value="2026-05">اردیبهشت ۱۴۰۵ (May 2026)</option>
              <option value="2026-04">فروردین ۱۴۰۵ (April 2026)</option>
              <option value="2026-03">اسفند ۱۴۰۴ (March 2026)</option>
              <option value="2026-02">بهمن ۱۴۰۴ (February 2026)</option>
              <option value="2026-01">دی ۱۴۰۴ (January 2026)</option>
              <option value="2025-12">آذر ۱۴۰۴ (December 2025)</option>
              <option value="2025-11">آبان ۱۴۰۴ (November 2025)</option>
              <option value="2025-10">مهر ۱۴۰۴ (October 2025)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Income vs Expenses comparative bars */}
          <div className="md:col-span-2 space-y-3">
            <div>
              <div className="flex justify-between text-[11px] mb-1 font-semibold">
                <span className="text-slate-500">جمع درآمدهای ثبت‌شده دوره:</span>
                <span className="text-emerald-500 font-mono">+{ana.income.toLocaleString()} تومان</span>
              </div>
              <div className="w-full bg-slate-200/40 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all" 
                  style={{ width: `${ana.income + ana.expense > 0 ? (ana.income / (ana.income + ana.expense)) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-semibold">
                <span className="text-slate-500">جمع هزینه‌ها و مخارج زندگی:</span>
                <span className="text-rose-500 font-mono">-{ana.expense.toLocaleString()} تومان</span>
              </div>
              <div className="w-full bg-slate-200/40 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all" 
                  style={{ width: `${ana.income + ana.expense > 0 ? (ana.expense / (ana.income + ana.expense)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Glowing Badged status column - Requested by User */}
          <div className={`p-4 rounded-xl border text-center space-y-2 ${
            ana.balance >= 0 
              ? (darkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50/50 border-emerald-100 text-emerald-800')
              : (darkMode ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' : 'bg-rose-50/50 border-rose-100 text-rose-800')
          }`}>
            <div className="text-[10px] text-slate-450 font-bold">تراز عملیاتی نهایی ماه:</div>
            
            <div className="text-sm font-black font-mono tracking-wide">
              {ana.balance >= 0 ? '+' : ''}{ana.balance.toLocaleString()} تومان
            </div>

            {ana.balance >= 0 ? (
              <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-500">
                🟢 تراز مالی مثبت و سودده
              </span>
            ) : (
              <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-500 animate-pulse">
                🔴 تراز منفی و زیانده دوره
              </span>
            )}

            <p className="text-[8px] text-slate-400 leading-normal font-sans">
              {ana.balance >= 0 
                ? 'خوشبختانه عملکرد درآمدی تراز خالص شما را مثبت نگاه داشته است.' 
                : 'توجه: مخارج شما در این دوره پیشی گرفته است، نسبت ترید بر خریدهای غیرضروری افزایش یابد.'}
            </p>
          </div>
        </div>

        {/* Previous Month comparative metric banner */}
        <div className={`p-2.5 border rounded-xl flex items-center justify-between text-[10px] ${
          darkMode ? 'bg-slate-950/20 border-slate-850' : 'bg-zinc-50 border-zinc-100'
        }`}>
          <span className="text-slate-450 font-medium">مقایسه نوسان تراز با ماه قبل ({ana.prevMonthStr}):</span>
          <div className="flex gap-2">
            <span className="text-slate-400">ترازش: <strong className="font-mono">{ana.prevBalance.toLocaleString()} تومان</strong></span>
            {ana.balance >= ana.prevBalance ? (
              <span className="text-emerald-500 font-bold">▲ بهبود برآیند سود</span>
            ) : (
              <span className="text-rose-500 font-bold">▼ نزول برآیند سود</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid layouts detailing inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TOP LEFT: Transactions track logs */}
        <div className={`p-5 border rounded-2xl shadow-sm space-y-4 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="border-b border-indigo-100/10 pb-2">
            <h3 className="text-sm font-bold font-display">گردش نقدی دخل و خرج (Cash Flow Tracker)</h3>
            <p className="text-[10px] text-slate-400 mt-1">امکان دسته‌بندی مخارج روزانه مسکن، تردد، غذا، و تسویه بر سود ترید</p>
          </div>

          <form onSubmit={handleAddTxSubmit} className={`grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs p-3.5 rounded-xl text-right ${
            darkMode ? 'bg-slate-950/40 border border-slate-850' : 'bg-slate-50/70 border border-slate-100'
          }`}>
            <div className="md:col-span-2 flex justify-between border-b border-indigo-100/10 pb-2 mb-1">
              <span className="font-bold text-slate-400">ثبت گردش جدید</span>
              <div className="flex border rounded-lg p-0.5 bg-transparent" dir="ltr">
                <button 
                  type="button" 
                  onClick={() => { setTxType('expense'); setTxCategory('دیگر هزینه‌ها'); }}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    txType === 'expense' 
                      ? 'bg-rose-650 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-350'
                  }`}
                >
                  هزینه (Expense)
                </button>
                <button 
                  type="button" 
                  onClick={() => { setTxType('income'); setTxCategory('سود معامله‌گری'); }}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    txType === 'income' 
                      ? 'bg-emerald-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  درآمد (Income)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">عنوان تراکنش *</label>
              <input 
                type="text" 
                placeholder="تمدید هاست، دستمزد پروژه..."
                required
                value={txTitle} 
                onChange={(e) => setTxTitle(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white font-sans' : 'bg-white border-slate-205 text-slate-900'
                }`} 
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">مبلغ تراکنش (تومان) *</label>
              <input 
                type="number" 
                required
                placeholder="مبلغ"
                value={txAmount} 
                onChange={(e) => setTxAmount(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-505 text-xs font-mono text-left ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-205 text-slate-900'
                }`} 
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">دسته‌بندی موضوعی *</label>
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-550 text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white font-sans' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                {txType === 'expense' 
                  ? expenseCategories.map(c => <option key={c} value={c} className={darkMode ? 'bg-slate-900' : ''}>{c}</option>)
                  : incomeCategories.map(c => <option key={c} value={c} className={darkMode ? 'bg-slate-900' : ''}>{c}</option>)
                }
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">تاریخ ثبت</label>
              <input 
                type="date" 
                value={txDate} 
                onChange={(e) => setTxDate(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-505 text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-205 text-slate-900'
                }`} 
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-1">
              <button 
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Plus size={13} /> ثبت تراکنش در گردش حساب
              </button>
            </div>
          </form>

          {/* List transactions logs info */}
          <div className="text-xs max-h-[220px] overflow-y-auto space-y-2 pr-0.5">
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-sans text-[11px]">گردش حسابی تاکنون ثبت نشده است.</div>
            ) : (
              transactions.map(item => (
                <div key={item.id} className={`flex items-center justify-between p-2.5 border rounded-xl hover:bg-slate-900/10 transition-colors ${
                  darkMode ? 'bg-slate-950/20 border-slate-850' : 'bg-slate-50/20 border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      item.type === 'income' 
                        ? 'bg-emerald-500/15 text-emerald-400' 
                        : 'bg-rose-500/15 text-rose-455'
                    }`}>
                      {item.type === 'income' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.title}</h4>
                      <div className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-slate-500">{item.category}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-semibold font-mono ${item.type === 'income' ? 'text-emerald-500' : 'text-slate-405'}`}>
                      {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()} تومان
                    </span>
                    <button 
                      onClick={() => onDeleteTransaction(item.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        darkMode ? 'hover:bg-slate-800 text-slate-500 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TOP RIGHT: Capital / Investments & Growth Graph */}
        <div className={`p-5 border rounded-2xl shadow-sm space-y-4 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`border-b pb-2 flex justify-between items-center ${
            darkMode ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <h3 className="text-sm font-bold font-display">اموال و کالاهای سرمایه‌گذاری (پورتفوی مالی خودکار)</h3>
            <span className="text-[10px] text-slate-455 select-none">کلیک روی ارزش جهت ویرایش زنده موجودی دارایی</span>
          </div>

          {/* Asset Register Form */}
          <form onSubmit={handleAddAssetSubmit} className={`grid grid-cols-1 md:grid-cols-4 gap-2 text-xs p-3.5 rounded-xl items-end ${
            darkMode ? 'bg-slate-950/40 border border-slate-850' : 'bg-slate-50/70 border border-slate-100'
          }`}>
            <div className="md:col-span-4 pb-1 border-b border-indigo-100/10 mb-1 text-[10px] font-bold text-slate-400">
              ثبت اموال و کالاهای سرمایه‌گذاری (سیستم کل سبد را هر شنبه جمع زده و پلات می‌کند)
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-sans">کالای سرمایه‌گذاری / دارایی *</label>
              <input 
                type="text" 
                placeholder="مثلا: طلای ۱۸ عیار، بیت‌کوین، سهام بورس"
                required
                value={assetName} 
                onChange={(e) => setAssetName(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-105 font-sans' : 'bg-white border-slate-205'
                }`} 
              />
            </div>
            <div>
              <label className="block text-slate-455 mb-1">ارزش روز دارایی (تومان) *</label>
              <input 
                type="number" 
                placeholder="ارزش ریالی روز"
                required
                value={assetValue} 
                onChange={(e) => setAssetValue(e.target.value)}
                className={`w-full p-2 border rounded-lg font-mono text-left focus:outline-none focus:border-indigo-500 text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-205'
                }`} 
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-sans">تاریخ خرید / تملک *</label>
              <input 
                type="date" 
                required
                value={assetDate} 
                onChange={(e) => setAssetDate(e.target.value)}
                className={`w-full p-2 border rounded-lg font-mono focus:outline-none focus:border-indigo-500 text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-205'
                }`} 
              />
            </div>
            <div>
              <button 
                type="submit"
                className="w-full p-2 bg-indigo-650 text-white font-bold rounded-lg hover:bg-indigo-700 text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Plus size={12} /> ثبت کالا / دارایی
              </button>
            </div>
          </form>

          {/* Live Valuation Summary Card */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner transition-all ${
            darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-indigo-50/25 border-indigo-100/50'
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                برآیند کل سبد دارایی‌ها به صورت زنده (ارزش لحظه‌ای کل)
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                تغییر موجودی‌ها بلافاصله در کادر زیر محاسبه می‌شود. مقادیر نمودار تجمعی پایین منحصراً شنبه‌ها را پلات می‌کند.
              </p>
            </div>
            <div className="flex flex-col sm:items-end shrink-0">
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 rounded px-1.5 py-0.5 font-bold font-mono uppercase tracking-wide select-none">PROTFOLIO VALUE</span>
              <div className="text-sm font-black font-mono text-indigo-500 mt-1">
                {totalAssetsValue.toLocaleString()} تومان
              </div>
            </div>
          </div>

          {/* Render Vector Line Growth SVG */}
          {renderAssetGrowthChart()}

          {/* Assets Items detailed list with interactive in-line value updates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs max-h-[160px] overflow-y-auto">
            {assets.map(asset => (
              <div key={asset.id} className={`flex justify-between items-center p-2.5 border rounded-lg hover:bg-slate-900/10 transition-colors ${
                darkMode ? 'bg-slate-950/20 border-slate-850' : 'bg-slate-50/40 border-slate-200/80'
              }`}>
                <div>
                  <div className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{asset.name}</div>
                  <div className="text-[9px] text-slate-400">{asset.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  {editingAssetId === asset.id ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="number"
                        value={editingAssetVal}
                        onChange={(e) => setEditingAssetVal(e.target.value)}
                        onBlur={() => handleSaveAssetEdit(asset.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveAssetEdit(asset.id);
                          if (e.key === 'Escape') setEditingAssetId(null);
                        }}
                        className={`w-24 p-1 border border-indigo-500 rounded text-center font-mono focus:outline-none text-[11px] ${
                          darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-950'
                        }`}
                        autoFocus
                      />
                      <button 
                        type="button" 
                        onMouseDown={() => handleSaveAssetEdit(asset.id)}
                        className="p-1 text-emerald-500 bg-emerald-500/10 rounded"
                      >
                        <Check size={11} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span 
                        onClick={() => handleStartAssetEdit(asset.id, asset.value)}
                        className={`font-mono font-bold cursor-pointer hover:text-indigo-500 flex items-center gap-1 group transition-colors ${
                          darkMode ? 'text-slate-200' : 'text-slate-800'
                        }`}
                        title="کلیک جهت ویرایش آنلاین ارزش دارایی"
                      >
                        {asset.value.toLocaleString()} تومان
                        <Edit3 size={11} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all mr-0.5" />
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={() => onDeleteAsset(asset.id)}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      darkMode ? 'hover:bg-slate-800 text-slate-500 hover:text-white' : 'hover:bg-indigo-50 text-slate-400 hover:text-rose-600'
                    }`}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM LEFT: Loans Registry & Paid schedules (وام و تسهیلات) */}
        <div className={`p-5 border rounded-2xl shadow-sm space-y-4 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-205'
        }`}>
          <h3 className="text-sm font-bold font-display">دفتر وام و بازپرداخت اقساط ماهیانه</h3>

          {/* Register Loan Form */}
          <form onSubmit={handleAddLoanSubmit} className={`space-y-3 p-3.5 rounded-xl text-xs ${
            darkMode ? 'bg-slate-950/40 border border-slate-850' : 'bg-slate-50/70 border border-slate-100'
          }`}>
            <div className="font-bold text-slate-400 text-[10px]">ثبت تسهیلات بانکی معتبر</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-450 mb-1">عنوان تسهیلات / بانک</label>
                <input 
                  type="text" 
                  placeholder="وام مسکن جوانان..."
                  required
                  value={loanTitle} 
                  onChange={(e) => setLoanTitle(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-xs ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white font-sans' : 'bg-white border-slate-205'
                  }`} 
                />
              </div>
              <div>
                <label className="block text-slate-450 mb-1">مبلغ وام (تومان)</label>
                <input 
                  type="number" 
                  placeholder="مبلغ کل"
                  required
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-xs font-mono text-left ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-205'
                  }`} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-455 mb-1">تعداد بازپرداخت (ماه)</label>
                <input 
                  type="number" 
                  value={loanInstallments} 
                  onChange={(e) => setLoanInstallments(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-center font-mono text-xs ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-205 text-slate-900'
                  }`} 
                />
              </div>
              <div>
                <label className="block text-slate-455 mb-1">سررسید ماهیانه (ام هر ماه)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="31"
                  value={loanPayDay} 
                  onChange={(e) => setLoanPayDay(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-center font-mono text-xs ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-205 text-slate-900'
                  }`} 
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-450 mb-1">شرح کوتاه / وثیقه</label>
              <input 
                type="text" 
                placeholder="سند ملکی ضامن..."
                value={loanNotes} 
                onChange={(e) => setLoanNotes(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white font-sans' : 'bg-white border-slate-205'
                }`} 
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="px-4 py-2 bg-indigo-650 text-white font-bold rounded-lg hover:bg-indigo-700 text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Plus size={13} /> ثبت بازپرداخت تسهیلات
              </button>
            </div>
          </form>

          {/* Active Loans list logs */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
            {loans.length === 0 ? (
              <div className="p-6 text-center text-slate-550 text-xs">تسهیلاتی تاکنون ثبت نکرده‌اید.</div>
            ) : (
              loans.map(loan => {
                const totalInstallments = loan.installmentsCount;
                const paid = loan.installmentsPaid;
                const progressWidth = Math.min(100, (paid / totalInstallments) * 100);

                return (
                  <div key={loan.id} className={`p-3 border rounded-xl space-y-2.5 transition-colors ${
                    darkMode ? 'bg-slate-950/20 border-slate-850' : 'bg-slate-100/50 border-slate-200'
                  }`}>
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <h4 className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{loan.title}</h4>
                        <span className="text-[10px] text-slate-400">سررسید: هر ماه روز {loan.monthlyPaymentDay}ام</span>
                        {loan.notes && <span className="text-[9px] text-slate-500 mr-1.5">({loan.notes})</span>}
                      </div>

                      <div className="flex items-center gap-1.5 text-right font-sans">
                        <div className="text-[10px]">
                          <div className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-705'}`}>قسط: {loan.monthlyPaymentAmount.toLocaleString()} ت</div>
                          <div className="text-[9px] text-slate-450 font-mono">کل: {loan.amount.toLocaleString()} ت</div>
                        </div>
                        <button 
                          onClick={() => onPayLoanInstallment(loan.id)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold flex items-center gap-0.5 shadow-sm transition-all cursor-pointer"
                          title="تسویه این ماه"
                        >
                          <Check size={9} /> تسویه قسط
                        </button>
                        <button 
                          onClick={() => onDeleteLoan(loan.id)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            darkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className={`w-full h-1 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progressWidth}%` }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>{paid} از {totalInstallments} قسط پرداخت شده</span>
                        <span>{Math.round(progressWidth)}% پیشرفت تسویه</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* BOTTOM RIGHT: Debts and Claims (بدهی و طلب) */}
        <div className={`p-5 border rounded-2xl shadow-sm space-y-4 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-205'
        }`}>
          <h3 className="text-sm font-bold font-display">سیاهه‌ دیون: بدهی‌ها و مطالبات اشخاص</h3>

          {/* Add debt or claim */}
          <form onSubmit={handleAddDebtClaimSubmit} className={`space-y-3.5 p-3.5 rounded-xl text-xs ${
            darkMode ? 'bg-slate-950/40 border border-slate-850' : 'bg-slate-50/70 border border-slate-100'
          }`}>
            <div className="flex justify-between border-b border-indigo-100/10 pb-1.5 text-[10px] items-center">
              <span className="font-bold text-slate-400">ثبت بدهی جدید یا طلب از دیگران</span>
              <div className="flex border rounded-lg p-0.5" dir="ltr">
                <button 
                  type="button" 
                  onClick={() => setDcType('debt')}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    dcType === 'debt' 
                      ? 'bg-orange-600 text-white shadow-sm' 
                      : 'text-slate-400'
                  }`}
                >
                  بدهی من (Debt)
                </button>
                <button 
                  type="button" 
                  onClick={() => setDcType('claim')}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    dcType === 'claim' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400'
                  }`}
                >
                  طلب من (Claim)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-450 mb-1 font-semibold">طرف حساب (شخص)</label>
                <input 
                  type="text" 
                  placeholder="مثال: علی صادقی"
                  required
                  value={dcPerson} 
                  onChange={(e) => setDcPerson(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-xs ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white font-sans' : 'bg-white border-slate-205'
                  }`} 
                />
              </div>
              <div>
                <label className="block text-slate-450 mb-1 font-semibold">مبلغ تسویه (تومان)</label>
                <input 
                  type="number" 
                  placeholder="مثال: 12000000"
                  required
                  value={dcAmount} 
                  onChange={(e) => setDcAmount(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-xs font-mono text-left ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-205'
                  }`} 
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-450 mb-1">توضیحات کوتاه / سررسید قول داده شده</label>
              <input 
                type="text" 
                placeholder="قرض بابت سرویس خودرو..."
                value={dcNotes} 
                onChange={(e) => setDcNotes(e.target.value)}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-xs ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white font-sans' : 'bg-white border-slate-205'
                }`} 
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="px-4 py-2 bg-indigo-650 text-white font-bold rounded-lg hover:bg-indigo-700 text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Plus size={13} /> ثبت در سیاه دیون
              </button>
            </div>
          </form>

          {/* List Debts and Claims logs */}
          <div className="space-y-2 text-xs max-h-[220px] overflow-y-auto pr-0.5">
            {debtClaims.length === 0 ? (
              <div className="p-6 text-center text-slate-550 text-xs">موردی برای نمایش بابت بدهی یا طلب شما ثبت نشده است.</div>
            ) : (
              debtClaims.map(dc => (
                <div key={dc.id} className={`flex justify-between items-center p-2.5 border rounded-xl hover:bg-slate-900/10 transition-colors ${
                  darkMode ? 'bg-slate-950/20 border-slate-850' : 'bg-slate-50/20 border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dc.type === 'debt' ? 'bg-orange-500 animate-pulse' : 'bg-indigo-550'}`} title={dc.type === 'debt' ? 'بدهکارم' : 'طلبکارم'} />
                    <div>
                      <h4 className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-805'}`}>طرف حساب: {dc.person}</h4>
                      <p className="text-[10px] text-slate-450 leading-tight">
                        {dc.type === 'debt' ? 'باید به این شخص پرداخت کنم' : 'شخص باید به من پرداخت کند'}
                        {dc.notes && <span className="block text-[9px] text-slate-500 font-semibold mt-0.5">بابت: {dc.notes}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 font-sans justify-end text-left">
                    <div className="text-right">
                      <span className={`font-mono font-bold ${dc.type === 'debt' ? 'text-orange-500' : 'text-indigo-400'}`}>
                        {dc.amount.toLocaleString()} تومان
                      </span>
                      <div className="text-[8px] text-slate-405 font-mono mt-0.5">{dc.date}</div>
                    </div>
                    <button 
                      onClick={() => onDeleteDebtClaim(dc.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        darkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
                      }`}
                      title="تسویه شد و حذف"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
