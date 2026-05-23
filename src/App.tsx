/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Transaction, Budget, SavingGoal, TransactionType } from "./types";
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGETS, 
  INITIAL_GOALS 
} from "./initialData";
import { MetricCard } from "./components/MetricCard";
import { BudgetSection } from "./components/BudgetSection";
import { GoalsSection } from "./components/GoalsSection";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { VisualChart } from "./components/VisualChart";

import { 
  Landmark, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Calendar, 
  RefreshCw, 
  Trash2,
  Info,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Sync states with localStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("pft_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem("pft_budgets");
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<SavingGoal[]>(() => {
    const saved = localStorage.getItem("pft_goals");
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [notification, setNotification] = useState<{ msg: string; type: "success" | "info" } | null>(null);
  const [activeView, setActiveView] = useState<"all" | "transactions" | "budgets" | "goals">("all");

  // Trigger auto-saves to LocalStorage
  useEffect(() => {
    localStorage.setItem("pft_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("pft_budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("pft_goals", JSON.stringify(goals));
  }, [goals]);

  // Flash toast triggers
  const triggerNotification = (msg: string, type: "success" | "info" = "success") => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // State manipulation handlers
  const handleAddTransaction = (newTxData: {
    type: TransactionType;
    category: string;
    amount: number;
    date: string;
    description: string;
  }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      ...newTxData,
    };
    setTransactions((prev) => [newTx, ...prev]);
    triggerNotification(`Logged $${newTxData.amount.toFixed(2)} to ${newTxData.category}`);
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (target) {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      triggerNotification(`Removed transaction: ${target.description}`, "info");
    }
  };

  const handleUpdateBudget = (category: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: newLimit } : b))
    );
    triggerNotification(`Updated ${category} budget to $${newLimit}`);
  };

  const handleAddGoal = (name: string, targetNum: number, currentNum: number) => {
    const newGoal: SavingGoal = {
      id: `goal-${Date.now()}`,
      name,
      target: targetNum,
      current: currentNum,
    };
    setGoals((prev) => [...prev, newGoal]);
    triggerNotification(`Created savings goal: "${name}"`);
  };

  const handleUpdateGoalProgress = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updatedCurrent = Math.max(0, g.current + amount);
          return { ...g, current: updatedCurrent };
        }
        return g;
      })
    );
    triggerNotification(
      amount > 0 
        ? `Deposited $${amount.toLocaleString()} toward goal` 
        : `Withdrew $${Math.abs(amount).toLocaleString()} from goal`,
      amount > 0 ? "success" : "info"
    );
  };

  const handleDeleteGoal = (id: string) => {
    const target = goals.find((g) => g.id === id);
    if (target) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      triggerNotification(`Deleted savings goal: "${target.name}"`, "info");
    }
  };

  const handleResetToDemo = () => {
    if (window.confirm("Are you sure you want to reset all records back to demo initial values?")) {
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgets(INITIAL_BUDGETS);
      setGoals(INITIAL_GOALS);
      triggerNotification("Successfully reset application to pre-populated demo data!");
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all metrics? This starts a brand new blank ledger.")) {
      setTransactions([]);
      setBudgets(INITIAL_BUDGETS.map(b => ({ ...b, limit: 0 })));
      setGoals([]);
      triggerNotification("Cleared all ledger logs and saving milestones.", "info");
    }
  };

  // Bento Metric Calculations
  const metrics = React.useMemo(() => {
    let income = 0;
    let expenses = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") {
        income += tx.amount;
      } else {
        expenses += tx.amount;
      }
    });

    const balance = income - expenses;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;

    return {
      balance,
      income,
      expenses,
      savingsRate,
    };
  }, [transactions]);

  // Insights Banner text
  const currentInsight = React.useMemo(() => {
    if (transactions.length === 0) {
      return {
        text: "Your ledger is currently empty. Record some inflows and outflows below to unlock premium cash flow analytics!",
        level: "welcome"
      };
    }

    // Check if any limits are violated
    const expensesByCategory: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    const brokenBudgets = budgets.filter(b => b.limit > 0 && (expensesByCategory[b.category] || 0) > b.limit);
    if (brokenBudgets.length > 0) {
      return {
        text: `Budget Warning: You have exceeded your custom limits in ${brokenBudgets.map(b => b.category).join(", ")}. Consider pausing non-essential expenses.`,
        level: "warning"
      };
    }

    if (metrics.savingsRate < 20) {
      return {
        text: `Your current net Savings Rate is ${metrics.savingsRate.toFixed(1)}%. Financial planners recommend putting aside at least 20% of your gross monthly income towards goals.`,
        level: "caution"
      };
    }

    return {
      text: `Superb! You saved ${metrics.savingsRate.toFixed(1)}% of your gross income this month ($${metrics.balance.toFixed(2)} surplus). Keep funding your active savings milestones!`,
      level: "success"
    };
  }, [transactions, budgets, metrics]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900" id="app-viewport">
      
      {/* 1. TOAST NOTIFICATION BANNER */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -24, x: "-50%" }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border text-xs font-semibold ${
              notification.type === "success"
                ? "bg-slate-900 text-emerald-350 border-slate-800"
                : "bg-slate-900 text-slate-200 border-slate-800"
            }`}
            id="toast-notification"
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. LEFT SIDEBAR (LARGE VIEWPORTS ONLY) */}
      <aside className="w-68 bg-slate-900 text-slate-300 flex-col shrink-0 hidden lg:flex h-full border-r border-slate-800" id="app-sidebar">
        {/* Brand Block */}
        <div className="p-6 border-b border-slate-800/60 flex items-center space-x-3 shrink-0">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-600/15">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight leading-none">
              Capital Ledger
            </h1>
            <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 block mt-1">
              PRO EDITION
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">
            Workspace Console
          </span>

          <button
            onClick={() => setActiveView("all")}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeView === "all"
                ? "bg-slate-800 text-white font-bold border-l-4 border-indigo-500 pl-2 rounded-l-none"
                : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-100 font-medium animate-none"
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span className="text-xs">Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveView("transactions")}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeView === "transactions"
                ? "bg-slate-800 text-white font-bold border-l-4 border-indigo-500 pl-2 rounded-l-none"
                : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-100 font-medium animate-none"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs">Ledger Logs</span>
          </button>

          <button
            onClick={() => setActiveView("budgets")}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeView === "budgets"
                ? "bg-slate-800 text-white font-bold border-l-4 border-indigo-500 pl-2 rounded-l-none"
                : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-100 font-medium animate-none"
            }`}
          >
            <Percent className="w-4 h-4" />
            <span className="text-xs">Category Budgets</span>
          </button>

          <button
            onClick={() => setActiveView("goals")}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
              activeView === "goals"
                ? "bg-slate-800 text-white font-bold border-l-4 border-indigo-500 pl-2 rounded-l-none"
                : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-100 font-medium animate-none"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs">Savings Milestones</span>
          </button>
        </div>

        {/* User Card Segment */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/25 shrink-0">
          <div className="flex items-center space-x-3 p-1.5 rounded-lg">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold font-mono text-sm uppercase">
                U
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-slate-900 rounded-full animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-200 block truncate">ukungalawa</span>
              <span className="text-[10px] text-slate-500 block truncate">Owner Workspace</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 3. MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden" id="main-content-scroll">
        
        {/* Header Block */}
        <header className="bg-white border-b border-slate-200 py-3.5 px-6 md:px-8 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-30" id="app-header">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {activeView === "all" ? "Console Overview" : `${activeView} Workspace`}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              {activeView === "all" && "Command Dashboard"}
              {activeView === "transactions" && "Ledger Registry & Receipts"}
              {activeView === "budgets" && "Regulatory Budgets Control"}
              {activeView === "goals" && "Accumulator Savings Milestones"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
              {activeView === "all" && "Monitor real-time cash flow & active milestones"}
              {activeView === "transactions" && "Record revenue patterns or expense logs"}
              {activeView === "budgets" && "Keep categorised costs locked below boundaries"}
              {activeView === "goals" && "Fund and target future capital milestones"}
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Active Period Label */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-600 font-semibold font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>May 2026</span>
            </div>

            {/* Actions Quick-switch */}
            <button
              onClick={handleResetToDemo}
              className="px-3 py-1.5 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-xs font-bold flex items-center gap-1"
              title="Populate demo data"
              id="reset-demo-button"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Demo</span>
            </button>
            
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-white text-rose-500 hover:text-rose-700 hover:bg-rose-50/55 rounded-xl transition-all border border-rose-100 text-xs font-bold flex items-center gap-1"
              title="Clear all local data"
              id="clear-all-button"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Current</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Workspace */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          
          {/* Dynamic Mobile View Switcher (Visible on lg:hidden) */}
          <div className="lg:hidden flex items-center gap-1 bg-slate-150 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto shrink-0 mb-4 border border-slate-200" id="mobile-view-switcher">
            <button
              onClick={() => setActiveView("all")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeView === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView("transactions")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeView === "transactions" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Ledger Logs
            </button>
            <button
              onClick={() => setActiveView("budgets")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeView === "budgets" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Budgets
            </button>
            <button
              onClick={() => setActiveView("goals")}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeView === "goals" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Milestones
            </button>
          </div>

          {/* 4. FINANCIAL INTELLIGENCE ADVISOR / GENERAL HEALTH BANNER */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl border p-4.5 flex items-start gap-3.5 shadow-xs transition-all duration-300 ${
              currentInsight.level === "warning"
                ? "bg-rose-50/50 border-rose-100/75 text-rose-800 unicode-bidi"
                : currentInsight.level === "caution"
                ? "bg-amber-50/50 border-amber-100/75 text-amber-800"
                : currentInsight.level === "welcome"
                ? "bg-indigo-50/50 border-indigo-100/75 text-indigo-800"
                : "bg-emerald-50/50 border-emerald-100/75 text-emerald-800"
            }`}
            id="intelligence-banner"
          >
            <div className="mt-0.5 shrink-0">
              {currentInsight.level === "warning" ? (
                <AlertCircle className="w-4 h-4 text-rose-500" />
              ) : currentInsight.level === "caution" ? (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              )}
            </div>
            <div className="text-xs font-medium leading-relaxed">
              <span className="font-bold underline uppercase mr-2.5 bg-white/60 px-1.5 py-0.5 rounded text-[10px]">
                {currentInsight.level}
              </span>
              <span>{currentInsight.text}</span>
            </div>
          </motion.div>

          {/* SECTION A: DASHBOARD VIEW (Shown when view is "all") */}
          {activeView === "all" && (
            <div className="space-y-6" id="dashboard-tab-view">
              
              {/* TOP FOUR BENTO METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metric-grid">
                <MetricCard
                  title="Net Surplus Balance"
                  value={metrics.balance}
                  type="currency"
                  icon={<Landmark className="w-4 h-4" />}
                  theme="indigo"
                  trend={
                    transactions.length > 0 
                      ? { value: Math.round((metrics.balance / Math.max(metrics.income, 1)) * 100), isPositive: metrics.balance >= 0, label: "saved ratio" } 
                      : undefined
                  }
                />
                <MetricCard
                  title="Gross Cash Inflow"
                  value={metrics.income}
                  type="currency"
                  icon={<TrendingUp className="w-4 h-4" />}
                  theme="emerald"
                />
                <MetricCard
                  title="Gross Outgoing Payments"
                  value={metrics.expenses}
                  type="currency"
                  icon={<TrendingDown className="w-4 h-4" />}
                  theme="rose"
                  trend={
                    metrics.income > 0 
                      ? { value: Math.round((metrics.expenses / metrics.income) * 100), isPositive: false, label: "expense multiplier" } 
                      : undefined
                  }
                />
                <MetricCard
                  title="Net Savings Rate"
                  value={metrics.savingsRate}
                  type="percentage"
                  icon={<Percent className="w-4 h-4" />}
                  theme="cyan"
                  trend={
                    metrics.savingsRate >= 20 
                      ? { value: 20, isPositive: true, label: "target: 20%" } 
                      : { value: 20, isPositive: false, label: "target: 20%" }
                  }
                />
              </div>

              {/* SECOND ROW: INTERACTIVE CHARTS & PORTAL INPUTS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <VisualChart transactions={transactions} />
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  <TransactionForm onAddTransaction={handleAddTransaction} />
                </div>
              </div>

              {/* THIRD ROW: BUDGET MANAGEMENT & SAVING PROGRESS GOALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BudgetSection 
                  budgets={budgets} 
                  transactions={transactions} 
                  onUpdateBudget={handleUpdateBudget} 
                />

                <GoalsSection 
                  goals={goals} 
                  onAddGoal={handleAddGoal} 
                  onUpdateGoalProgress={handleUpdateGoalProgress} 
                  onDeleteGoal={handleDeleteGoal} 
                />
              </div>

              {/* FOURTH ROW: LEDGER TRANSACTION LOGS STREAM */}
              <div id="ledger-logs-row">
                <TransactionList 
                  transactions={transactions} 
                  onDeleteTransaction={handleDeleteTransaction} 
                />
              </div>

            </div>
          )}

          {/* SECTION B: TRANSACTIONS HUB (Shown when view is "transactions") */}
          {activeView === "transactions" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="transactions-tab-view">
              <div className="lg:col-span-4">
                <TransactionForm onAddTransaction={handleAddTransaction} />
              </div>
              <div className="lg:col-span-8">
                <TransactionList 
                  transactions={transactions} 
                  onDeleteTransaction={handleDeleteTransaction} 
                />
              </div>
            </div>
          )}

          {/* SECTION C: BUDGETS HUB (Shown when view is "budgets") */}
          {activeView === "budgets" && (
            <div className="max-w-4xl mx-auto" id="budgets-tab-view">
              <BudgetSection 
                budgets={budgets} 
                transactions={transactions} 
                onUpdateBudget={handleUpdateBudget} 
              />
            </div>
          )}

          {/* SECTION D: SAVINGS HUB (Shown when view is "goals") */}
          {activeView === "goals" && (
            <div className="max-w-4xl mx-auto" id="goals-tab-view">
              <GoalsSection 
                goals={goals} 
                onAddGoal={handleAddGoal} 
                onUpdateGoalProgress={handleUpdateGoalProgress} 
                onDeleteGoal={handleDeleteGoal} 
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

