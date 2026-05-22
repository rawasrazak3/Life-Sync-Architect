import React, { useState } from "react";
import { DollarSign, Tag, Calendar, Plus, Trash2, PieChart, TrendingUp, AlertTriangle, Search, Filter, CalendarDays, BarChart3, ListCollapse } from "lucide-react";
import { Expense } from "../types";

interface BudgetTrackerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onDeleteExpense: (id: string) => void;
  dailyBudgetLimit?: number; // e.g. $50 for small daily spend tracking
}

export default function BudgetTracker({
  expenses,
  onAddExpense,
  onDeleteExpense,
  dailyBudgetLimit = 50,
}: BudgetTrackerProps) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("Coffee");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Integrated sub-tabs inside budget tracking view
  const [budgetSubTab, setBudgetSubTab] = useState<"log" | "datewise" | "monthly">("log");
  
  // Custom Filters for records
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseFilterCategory, setExpenseFilterCategory] = useState<string>("All");
  const [expenseFilterMonth, setExpenseFilterMonth] = useState<string>("All");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;
    onAddExpense({
      description: desc,
      amount: parseFloat(amount),
      category,
      date,
    });
    setDesc("");
    setAmount("");
    setCategory("Coffee");
  };

  // Math totals
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = dailyBudgetLimit - totalSpent;
  const percentSpent = Math.min(100, Math.max(0, (totalSpent / dailyBudgetLimit) * 100));

  // Category splits list
  const categoriesList: Expense["category"][] = ["Food", "Transit", "Medical", "Coffee", "Household", "Other"];
  const spendByCategory = categoriesList.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {} as Record<Expense["category"], number>);

  // Determine unique months list from data for filter select elements (e.g. "2026-05")
  const uniqueMonths = Array.from(
    new Set(
      expenses.map((exp) => {
        const parts = exp.date.split("-");
        return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "";
      }).filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a));

  // Translate "2026-05" into "May 2026"
  const formatMonthYearLabel = (yyyyMm: string) => {
    if (!yyyyMm) return "";
    const [year, month] = yyyyMm.split("-");
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, 15);
    return dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Apply search & filtering to expenses for deep diagnostics
  const filteredProcessedExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.description.toLowerCase().includes(expenseSearch.toLowerCase());
    const matchesCategory = expenseFilterCategory === "All" || exp.category === expenseFilterCategory;
    
    const expYyyyMm = exp.date.split("-").slice(0, 2).join("-");
    const matchesMonth = expenseFilterMonth === "All" || expYyyyMm === expenseFilterMonth;
    
    return matchesSearch && matchesCategory && matchesMonth;
  });

  // 1. Group by specific DATE (Date-wise sum)
  const dateWiseGroups = filteredProcessedExpenses.reduce((groups, exp) => {
    if (!groups[exp.date]) {
      groups[exp.date] = {
        date: exp.date,
        total: 0,
        items: [],
      };
    }
    groups[exp.date].total += exp.amount;
    groups[exp.date].items.push(exp);
    return groups;
  }, {} as Record<string, { date: string; total: number; items: Expense[] }>);

  const sortedDateGroups = Object.values(dateWiseGroups).sort((a, b) => b.date.localeCompare(a.date));

  // 2. Group by specific MONTH (Month-wise sum)
  const monthWiseGroups = expenses.reduce((groups, exp) => {
    const yyyyMm = exp.date.split("-").slice(0, 2).join("-");
    if (!groups[yyyyMm]) {
      groups[yyyyMm] = {
        month: yyyyMm,
        total: 0,
        itemsCount: 0,
        highestSpent: 0,
        categories: {} as Record<string, number>,
      };
    }
    groups[yyyyMm].total += exp.amount;
    groups[yyyyMm].itemsCount += 1;
    if (exp.amount > groups[yyyyMm].highestSpent) {
      groups[yyyyMm].highestSpent = exp.amount;
    }
    groups[yyyyMm].categories[exp.category] = (groups[yyyyMm].categories[exp.category] || 0) + exp.amount;
    return groups;
  }, {} as Record<string, { month: string; total: number; itemsCount: number; highestSpent: number; categories: Record<string, number> }>);

  const sortedMonthGroups = Object.values(monthWiseGroups).sort((a, b) => b.month.localeCompare(a.month));

  return (
    <div id="budget-tracker-panel" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-550" />
            <h2 className="text-base font-bold font-display text-slate-800 dark:text-slate-150">Financial Ledger & Smart Budget</h2>
          </div>
          <div className="flex bg-slate-100/80 dark:bg-slate-800/85 p-1 rounded-xl border border-slate-205/45 dark:border-slate-750/50 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBudgetSubTab("log")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-3xs font-bold rounded-lg transition-all cursor-pointer ${
                budgetSubTab === "log"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <ListCollapse className="w-3 h-3" />
              <span>Log Spend</span>
            </button>
            <button
              type="button"
              onClick={() => setBudgetSubTab("datewise")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-3xs font-bold rounded-lg transition-all cursor-pointer ${
                budgetSubTab === "datewise"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              <span>Date-wise</span>
            </button>
            <button
              type="button"
              onClick={() => setBudgetSubTab("monthly")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-3xs font-bold rounded-lg transition-all cursor-pointer ${
                budgetSubTab === "monthly"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Monthly-wise</span>
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Audit daily transactional micro-expenses, analyze date splits, and review monthly reports.</p>
      </div>

      <div className="p-5">
        {/* Core Gauge is visible across all internal sub-tabs so there's immediate feedback */}
        <div className="mb-5 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily Spending Safety Allowance: </span>
              <strong className="text-sm font-bold text-slate-700 dark:text-slate-300">${dailyBudgetLimit}</strong>
            </div>
            <span className={`text-xs font-semibold font-mono ${remainingBudget >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
              {remainingBudget >= 0 ? `$${remainingBudget.toFixed(2)} Remaining` : `$${Math.abs(remainingBudget).toFixed(2)} Exceeded`}
            </span>
          </div>

          <div className="w-full bg-slate-200/60 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentSpent > 90 ? "bg-rose-500" : percentSpent > 70 ? "bg-amber-500" : "bg-indigo-500 dark:bg-indigo-600"
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-3xs text-slate-400 dark:text-slate-500 font-mono">
            <span>Logged Ledger Sum: ${totalSpent.toFixed(2)}</span>
            <span className="font-semibold">{percentSpent.toFixed(0)}% consumed</span>
          </div>

          {percentSpent > 100 && (
            <div className="flex items-center gap-2 mt-3 p-2.5 bg-rose-50/70 dark:bg-rose-955/20 rounded-lg text-2xs text-rose-800 dark:text-rose-300 font-medium border border-rose-100 dark:border-rose-900/35">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>Spend ceiling exceeded! Consider reducing non-essential variables to preserve logistical assets.</span>
            </div>
          )}
        </div>

        {/* 1. TABS PANEL - LOG & ACTIVITY ENTRY */}
        {budgetSubTab === "log" && (
          <div className="space-y-6">
            {/* Entry Form */}
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/20 dark:bg-slate-950/10 p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
              <div className="sm:col-span-2">
                <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 font-display">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Espresso, Cab to clinic, Hospital Pharmacy..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:col-span-2 md:col-span-2">
                <div>
                  <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 font-display font-medium">Cost (USD)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-3xs text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 pl-5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 font-display font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden font-semibold"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 font-display font-medium">Calendar Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={!desc.trim() || !amount}
                  className="w-full bg-slate-850 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Expense</span>
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* List */}
              <div className="md:col-span-2">
                <h3 className="text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Recent Transactions Log</h3>
                <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5">
                  {expenses.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400 dark:text-slate-550 mr-1">Ledger registry empty. Log variables above.</p>
                    </div>
                  ) : (
                    [...expenses].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 15).map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-950/15 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="p-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded text-3xs font-mono font-bold text-slate-550 dark:text-slate-400 uppercase leading-none">
                            {exp.category}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{exp.description}</p>
                            <span className="text-3xs text-slate-400 dark:text-slate-500 font-mono block">{exp.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-205 font-mono">
                            ${exp.amount.toFixed(2)}
                          </span>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="text-slate-300 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-450 p-1 rounded cursor-pointer transition-colors"
                            title="Delete log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Splits */}
              <div className="bg-slate-50/40 dark:bg-slate-955/10 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                <h4 className="text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-202/50 dark:border-slate-800/80 pb-2 mb-3.5 flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Category Splits</span>
                </h4>
                <div className="space-y-3">
                  {categoriesList.map(cat => {
                    const amt = spendByCategory[cat] || 0;
                    const ratio = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-3xs">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">{cat}</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">${amt.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-slate-200/50 dark:bg-slate-800 h-1 rounded-full">
                          <div
                            className="bg-indigo-550 dark:bg-indigo-400 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TABS PANEL - DATE-WISE BREAKDOWN */}
        {budgetSubTab === "datewise" && (
          <div className="space-y-4">
            {/* Search/filtering bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter description..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 text-3xs border border-slate-200 dark:border-slate-800 rounded-lg pl-8 p-1.5 text-slate-850 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <select
                  value={expenseFilterCategory}
                  onChange={(e) => setExpenseFilterCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-3xs rounded-lg p-1 px-1.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="All">All Categories</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <select
                  value={expenseFilterMonth}
                  onChange={(e) => setExpenseFilterMonth(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-3xs rounded-lg p-1 px-1.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="All">All Months</option>
                  {uniqueMonths.map(m => (
                    <option key={m} value={m}>{formatMonthYearLabel(m)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List Grouped by Dates */}
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {sortedDateGroups.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-100 dark:border-slate-805">
                  <p className="text-xs text-slate-400 dark:text-slate-500">No date-wise matches found. Adjust filter settings or log new variables.</p>
                </div>
              ) : (
                sortedDateGroups.map((group) => {
                  const isDailyLimitExceeded = group.total > dailyBudgetLimit;
                  return (
                    <div key={group.date} className="bg-slate-50/45 dark:bg-slate-955/15 rounded-xl border border-slate-100 dark:border-slate-800/70 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-202/50 dark:border-slate-800 pb-1.5">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-indigo-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-205">
                            {new Date(group.date + "T00:00:00").toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            isDailyLimitExceeded 
                              ? "bg-rose-50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30" 
                              : "text-slate-700 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-800"
                          }`}>
                            Spent: ${group.total.toFixed(2)}
                          </span>
                          {isDailyLimitExceeded && (
                            <span className="text-[9px] bg-rose-500 text-white font-bold uppercase tracking-wider px-1.5 rounded" title="Over single daily allowance ceiling">
                              Overrun
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100/50 dark:divide-slate-800/40">
                        {group.items.map((item) => (
                          <div key={item.id} className="pt-2 pb-1.5 first:pt-0 flex items-center justify-between text-2xs gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 px-1 py-0.5 rounded font-mono uppercase tracking-tight">
                                {item.category}
                              </span>
                              <span className="font-semibold text-slate-750 dark:text-slate-300 truncate">{item.description}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="font-mono text-slate-650 dark:text-slate-355 font-bold">${item.amount.toFixed(2)}</span>
                              <button
                                onClick={() => onDeleteExpense(item.id)}
                                className="text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-450 p-0.5 pointer-events-auto cursor-pointer"
                                title="Delete from ledger"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 3. TABS PANEL - MONTHLY-WISE REPORTS */}
        {budgetSubTab === "monthly" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Historical Monthly spending records</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
              {sortedMonthGroups.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/20 col-span-2 rounded-xl border border-dashed border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-505">No transaction logs available across any historic months.</p>
                </div>
              ) : (
                sortedMonthGroups.map((monthGroup) => {
                  const monthlyLimit = dailyBudgetLimit * 30; // approx limit extrapolation
                  const isMonthlyLimitExceeded = monthGroup.total > monthlyLimit;
                  
                  return (
                    <div key={monthGroup.month} className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl flex flex-col justify-between space-y-4">
                      <div>
                        {/* Title group */}
                        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2 mb-3.5">
                          <div>
                            <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200">{formatMonthYearLabel(monthGroup.month)}</h4>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{monthGroup.itemsCount} separate item invoices</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold font-mono text-indigo-700 dark:text-indigo-400 block">${monthGroup.total.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 block">Total monthly debit</span>
                          </div>
                        </div>

                        {/* Internal KPI cards */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-lg text-center">
                            <span className="text-[9px] text-slate-400 uppercase block tracking-wider font-semibold">Average cost</span>
                            <span className="text-xs font-bold font-display text-slate-700 dark:text-slate-300 font-mono">
                              ${(monthGroup.total / (monthGroup.itemsCount || 1)).toFixed(2)}
                            </span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 p-2 rounded-lg text-center">
                            <span className="text-[9px] text-slate-400 uppercase block tracking-wider font-semibold">Peak single spent</span>
                            <span className="text-xs font-bold font-display text-rose-500 dark:text-rose-450 font-mono">
                              ${monthGroup.highestSpent.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Month Category Breakdown */}
                        <div className="space-y-1.5 self-end">
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 block">Core Category Debits:</span>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-3xs font-mono">
                            {Object.entries(monthGroup.categories).map(([cat, amt]) => (
                              <div key={cat} className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                <span>{cat}</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">${amt.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bar graph progression indicator */}
                      <div className="pt-2 border-t border-slate-205/40 dark:border-slate-805">
                        <div className="flex justify-between text-[10px] text-slate-450 mb-1">
                          <span>Progress ratio (est. max pool limit: ${monthlyLimit})</span>
                          <span className="font-bold">{((monthGroup.total / monthlyLimit) * 15).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isMonthlyLimitExceeded ? "bg-rose-500" : "bg-emerald-500 dark:bg-emerald-450"
                            }`}
                            style={{ width: `${Math.min(100, (monthGroup.total / monthlyLimit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
