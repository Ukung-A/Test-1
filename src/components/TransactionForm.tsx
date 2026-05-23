import React, { useState } from "react";
import { TransactionType } from "../types";
import { AVAILABLE_EXPENSE_CATEGORIES, AVAILABLE_INCOME_CATEGORIES } from "../initialData";
import { PlusCircle, DollarSign, Calendar, Tag, FileText } from "lucide-react";

interface TransactionFormProps {
  onAddTransaction: (data: {
    type: TransactionType;
    category: string;
    amount: number;
    date: string;
    description: string;
  }) => void;
}

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => {
    // Default to current date (2026-05-23 based on metadata)
    return "2026-05-23";
  });
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const categories = type === "expense" ? AVAILABLE_EXPENSE_CATEGORIES : AVAILABLE_INCOME_CATEGORIES;

  // Auto-set the first category when type switches
  React.useEffect(() => {
    setCategory(categories[0] || "");
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid amount greater than 0");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Please provide a brief description");
      return;
    }

    onAddTransaction({
      type,
      category,
      amount: parsedAmount,
      date,
      description: description.trim()
    });

    // Clear inputs (except for date, type and category which are nice sticky selectors)
    setAmount("");
    setDescription("");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs flex flex-col h-full transition-all duration-300 hover:shadow-sm" id="new-transaction-panel">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Record Transaction</h2>
        <p className="text-xs text-slate-400">Instantly record incoming revenue or outgoing payments</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Type Toggle Slider */}
          <div className="p-1 bg-slate-100 rounded-xl flex">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === "expense"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="toggle-type-expense"
            >
              Expense Outflow
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === "income"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="toggle-type-income"
            >
              Income Inflow
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Amount Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400" /> Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="24.50"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 font-mono font-semibold"
                id="tx-input-amount"
              />
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Transact Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 font-mono"
                id="tx-input-date"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" /> Category Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 font-semibold text-slate-700"
              id="tx-input-category"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" /> Remarks / Details
            </label>
            <input
              type="text"
              placeholder="e.g., Target grocery visit, subscription charge"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
              id="tx-input-desc"
            />
          </div>
        </div>

        <div className="mt-6">
          {errorMsg && (
            <p className="text-xs text-rose-500 font-medium mb-2 text-center" id="tx-error-message">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5 ${
              type === "expense"
                ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-950/10"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10"
            }`}
            id="tx-submit-button"
          >
            <PlusCircle className="w-4 h-4" /> Save Record
          </button>
        </div>
      </form>
    </div>
  );
}
