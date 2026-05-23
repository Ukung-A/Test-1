import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Transaction, SortField, SortOrder, TransactionType } from "../types";
import {
  Search,
  SlidersHorizontal,
  Home,
  Utensils,
  Zap,
  Car,
  Film,
  ShoppingBag,
  Activity,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  HelpCircle,
  Trash2,
  ListFilter,
  ArrowUpDown
} from "lucide-react";
import { CATEGORY_COLORS } from "../initialData";

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export function TransactionList({ transactions, onDeleteTransaction }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Get dynamic unique categories that exist in transactions for filtering
  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats);
  }, [transactions]);

  // Icons mapper for clean aesthetics
  const getCategoryIcon = (cat: string) => {
    const normalized = cat.toLowerCase();
    switch (normalized) {
      case "housing":
        return <Home className="w-4 h-4" />;
      case "food":
        return <Utensils className="w-4 h-4" />;
      case "utilities":
        return <Zap className="w-4 h-4" />;
      case "transport":
        return <Car className="w-4 h-4" />;
      case "entertainment":
        return <Film className="w-4 h-4" />;
      case "shopping":
        return <ShoppingBag className="w-4 h-4" />;
      case "health":
        return <Activity className="w-4 h-4" />;
      case "salary":
        return <Briefcase className="w-4 h-4" />;
      case "freelance":
        return <Laptop className="w-4 h-4" />;
      case "investments":
        return <TrendingUp className="w-4 h-4" />;
      case "gifts":
        return <Gift className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  // Filtering & Sorting pipeline
  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch =
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || t.type === typeFilter;
        const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === "date") {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === "amount") {
          comparison = a.amount - b.amount;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to newest/highest on select
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs flex flex-col h-full transition-all duration-300 hover:shadow-sm" id="history-transactions-list">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Ledger Logs</h2>
          <p className="text-xs text-slate-400">Search, filter, and audit chronological cash-flows</p>
        </div>

        {/* Sorting controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSort("date")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 border transition-all ${
              sortField === "date"
                ? "bg-slate-900 text-white border-slate-950"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            id="sort-by-date"
          >
            Date
            <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => toggleSort("amount")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 border transition-all ${
              sortField === "amount"
                ? "bg-slate-900 text-white border-slate-950"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            id="sort-by-amount"
          >
            Amount
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-white focus:border-indigo-500 transition-all font-medium"
            id="search-transactions"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TransactionType | "all")}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-semibold text-slate-600"
            id="filter-by-type"
          >
            <option value="all">All Cash-flows</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-semibold text-slate-600"
            id="filter-by-category"
          >
            <option value="all">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table/Card Stream */}
      <div className="flex-1 overflow-y-auto max-h-[480px] pr-1 space-y-2.5">
        <AnimatePresence initial={false}>
          {filteredAndSortedTransactions.map((tx) => {
            const isExpense = tx.type === "expense";
            const color = CATEGORY_COLORS[tx.category] || "#6b7280";

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group p-3.5 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50/20 flex items-center justify-between transition-all"
                id={`transaction-item-${tx.id}`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Category circular icon indicator */}
                  <div
                    className="p-3 rounded-xl border flex items-center justify-center shrink-0"
                    style={{
                      color: color,
                      backgroundColor: `${color}0d`, // 5% opacity
                      borderColor: `${color}26` // 15% opacity
                    }}
                  >
                    {getCategoryIcon(tx.category)}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-800 truncate leading-snug-expanded">
                      {tx.description}
                    </h4>
                    <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400 font-medium">
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {tx.category}
                      </span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 pl-4">
                  <div className="text-right">
                    <span
                      className={`font-mono text-sm font-bold block ${
                        isExpense ? "text-slate-800" : "text-emerald-600"
                      }`}
                    >
                      {isExpense ? "-" : "+"}
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize block font-semibold">
                      {tx.type}
                    </span>
                  </div>

                  {/* Deletion button only visible on hover */}
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete record"
                    id={`delete-tx-${tx.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAndSortedTransactions.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <ListFilter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span className="text-xs">No matching transactions found with active criteria.</span>
          </div>
        )}
      </div>
    </div>
  );
}
