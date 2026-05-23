import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Budget, Transaction } from "../types";
import { CATEGORY_COLORS } from "../initialData";
import { Plus, Edit2, Check, X, AlertTriangle, AlertOctagon } from "lucide-react";

interface BudgetSectionProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateBudget: (category: string, newLimit: number) => void;
}

export function BudgetSection({ budgets, transactions, onUpdateBudget }: BudgetSectionProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState<string>("");

  // Calculate actual spending per category for current month
  const getExpensesByCategory = () => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const map: Record<string, number> = {};
    expenses.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  };

  const expensesByCategory = getExpensesByCategory();

  const startEditing = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setEditLimit(currentLimit.toString());
  };

  const handleSave = (category: string) => {
    const parsed = parseFloat(editLimit);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(category, parsed);
    }
    setEditingCategory(null);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs flex flex-col h-full transition-all duration-300 hover:shadow-sm" id="budget-section">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Category Budgets</h2>
          <p className="text-xs text-slate-400">Track and adjust limits for key expense categories</p>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1 max-h-[350px]">
        {budgets.map((budget) => {
          const spent = expensesByCategory[budget.category] || 0;
          const limit = budget.limit;
          const pct = limit > 0 ? (spent / limit) * 100 : 0;
          const isOverLimit = spent > limit;
          const isWarningLimit = spent > limit * 0.8 && spent <= limit;
          const barColor = CATEGORY_COLORS[budget.category] || "#64748b";

          return (
            <div key={budget.category} className="p-3.5 rounded-xl border border-slate-50 hover:border-slate-100 bg-slate-50/30 transition-colors" id={`budget-row-${budget.category.toLowerCase()}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: barColor }}
                  />
                  <span className="font-semibold text-sm text-slate-800">{budget.category}</span>
                </div>

                {editingCategory === budget.category ? (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-slate-400 mr-1">$</span>
                    <input
                      type="number"
                      value={editLimit}
                      onChange={(e) => setEditLimit(e.target.value)}
                      className="w-20 px-1.5 py-0.5 text-xs text-right font-mono border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(budget.category)}
                      className="p-1 hover:bg-emerald-100 text-emerald-600 rounded-md transition-colors"
                      title="Save limit"
                      id="save-budget-limit"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1 hover:bg-slate-200 text-slate-500 rounded-md transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono font-medium text-slate-600 mr-2">
                      <span className="font-semibold text-slate-800">${spent.toFixed(2)}</span>
                      <span className="text-slate-400"> / ${limit.toFixed(0)}</span>
                    </span>
                    <button
                      onClick={() => startEditing(budget.category, limit)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition-all"
                      style={{ opacity: 1 }} // fallback to keep simple and discoverable
                      title="Adjust budget limit"
                      id={`edit-budget-${budget.category.toLowerCase()}`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Bar Container */}
              <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: isOverLimit
                      ? "#ef4444" // red
                      : isWarningLimit
                      ? "#f59e0b" // amber
                      : barColor,
                  }}
                />
              </div>

              {/* Dynamic Warning Alert Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{pct.toFixed(0)}% Utilized</span>
                <AnimatePresence>
                  {isOverLimit && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center text-rose-600 gap-1 font-semibold"
                    >
                      <AlertOctagon className="w-3 h-3 text-rose-500 animate-pulse" />
                      Over Budget by ${(spent - limit).toFixed(2)}
                    </motion.span>
                  )}
                  {isWarningLimit && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center text-amber-600 gap-1 font-semibold"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Approaching limit!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
