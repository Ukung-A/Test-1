import React, { useState, useMemo } from "react";
import { Transaction } from "../types";
import { CATEGORY_COLORS } from "../initialData";
import { TrendingUp, PieChart, Landmark, Info } from "lucide-react";
import { motion } from "motion/react";

interface VisualChartProps {
  transactions: Transaction[];
}

export function VisualChart({ transactions }: VisualChartProps) {
  const [activeTab, setActiveTab] = useState<"flow" | "categories">("flow");
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // 1. Weekly Flows Aggregation (Week 1: 1-7, Week 2: 8-14, Week 3: 15-21, Week 4: 22+)
  const weeklyFlowData = useMemo(() => {
    const weeks = [
      { label: "W1 (May 1-7)", income: 0, expense: 0 },
      { label: "W2 (May 8-14)", income: 0, expense: 0 },
      { label: "W3 (May 15-21)", income: 0, expense: 0 },
      { label: "W4 (May 22+)", income: 0, expense: 0 },
    ];

    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const day = date.getDate();
      let weekIndex = 3; // Week 4 default

      if (day <= 7) weekIndex = 0;
      else if (day <= 14) weekIndex = 1;
      else if (day <= 21) weekIndex = 2;

      if (tx.type === "income") {
        weeks[weekIndex].income += tx.amount;
      } else {
        weeks[weekIndex].expense += tx.amount;
      }
    });

    return weeks;
  }, [transactions]);

  const maxWeeklyValue = useMemo(() => {
    let max = 1000; // default baseline floor
    weeklyFlowData.forEach((w) => {
      if (w.income > max) max = w.income;
      if (w.expense > max) max = w.expense;
    });
    return max * 1.15; // padding top
  }, [weeklyFlowData]);

  // 2. Category Share calculations (Expenses only)
  const categoryShareData = useMemo(() => {
    const expenseTx = transactions.filter((t) => t.type === "expense");
    const totals: Record<string, number> = {};
    let sum = 0;

    expenseTx.forEach((tx) => {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
      sum += tx.amount;
    });

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: sum > 0 ? (amount / sum) * 100 : 0,
        color: CATEGORY_COLORS[category] || "#6b7280",
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalExpenseSum = useMemo(() => {
    return categoryShareData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [categoryShareData]);

  // Calculate SVG circle properties for donut ring
  const donutRadius = 50;
  const circumference = 2 * Math.PI * donutRadius; // ≈ 314.16

  const donutSegments = useMemo(() => {
    let accumulatedPercentage = 0;

    return categoryShareData.map((item) => {
      const pct = item.percentage;
      const strokeLength = (pct / 100) * circumference;
      const strokeOffset = circumference - (accumulatedPercentage / 100) * circumference;
      accumulatedPercentage += pct;

      return {
        ...item,
        strokeLength,
        strokeOffset,
      };
    });
  }, [categoryShareData, circumference]);

  // Hover item details
  const displayedCategoryDetail = useMemo(() => {
    if (hoveredCategory) {
      const match = categoryShareData.find((c) => c.category === hoveredCategory);
      return match || null;
    }
    return null;
  }, [hoveredCategory, categoryShareData]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs flex flex-col h-full transition-all duration-300 hover:shadow-sm" id="visual-chart-box">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Interactive Visualizers</h2>
          <p className="text-xs text-slate-400">Analyze capital allocation and weekly flow fluctuations</p>
        </div>

        {/* Tab triggers */}
        <div className="p-1 bg-slate-100 rounded-xl flex space-x-1 shrink-0">
          <button
            onClick={() => setActiveTab("flow")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === "flow"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            id="tab-chart-flow"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Flow
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === "categories"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            id="tab-chart-categories"
          >
            <PieChart className="w-3.5 h-3.5" /> Shares
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[220px]">
        {activeTab === "flow" ? (
          /* SECTION A: WEEKLY FLOW COLUMN BARS */
          <div className="w-full h-full flex flex-col">
            <div className="relative flex-1 flex items-end justify-between h-44 px-2 select-none border-b border-slate-100 mb-2">
              {weeklyFlowData.map((week, index) => {
                const incomeHeightPct = (week.income / maxWeeklyValue) * 100;
                const expenseHeightPct = (week.expense / maxWeeklyValue) * 100;
                const isHovered = hoveredWeek === index;

                return (
                  <div
                    key={week.label}
                    className="flex flex-col items-center flex-1 mx-2 h-full justify-end relative group"
                    onMouseEnter={() => setHoveredWeek(index)}
                    onMouseLeave={() => setHoveredWeek(null)}
                  >
                    {/* Hover detail tooltip */}
                    {isHovered && (
                      <div className="absolute top-0 bg-slate-900 text-white rounded-lg p-2 shadow-lg text-[11px] font-mono z-20 pointer-events-none flex flex-col gap-0.5 min-w-[124px] text-center border border-slate-850">
                        <span className="font-sans font-bold text-slate-300 border-b border-slate-800 pb-0.5 mb-1">
                          {week.label}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          In: +${week.income.toFixed(2)}
                        </span>
                        <span className="text-rose-400 font-bold">
                          Out: -${week.expense.toFixed(2)}
                        </span>
                        <span className="text-white border-t border-slate-800 pt-0.5 mt-0.5 font-bold">
                          Net: ${(week.income - week.expense).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-end space-x-1.5 w-full justify-center h-full pb-1">
                      {/* Income Bar (emerald) */}
                      <motion.div
                        className={`w-6 bg-emerald-500 rounded-t-md transition-all duration-300 shadow-sm ${
                          isHovered ? "brightness-105" : "hover:brightness-105"
                        }`}
                        style={{ height: `${Math.max(incomeHeightPct, 4)}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      />
                      {/* Expense Bar (indigo) */}
                      <motion.div
                        className={`w-6 bg-indigo-500 rounded-t-md transition-all duration-300 shadow-sm ${
                          isHovered ? "brightness-105" : "hover:brightness-105"
                        }`}
                        style={{ height: `${Math.max(expenseHeightPct, 4)}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.05 + 0.1 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Labels and legends */}
            <div className="grid grid-cols-4 px-2 text-[10px] font-bold text-slate-400 tracking-wider text-center pt-1 border-t border-slate-50">
              {weeklyFlowData.map((week) => (
                <span key={week.label}>{week.label.split(" ")[0]}</span>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 text-xs font-semibold text-slate-500 border-t border-slate-5/50 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" />
                <span>Earned Inflows</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-indigo-500 rounded-sm inline-block" />
                <span>Expense Outflows</span>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION B: CUSTOM SVG DONUT SHARES */
          <div className="w-full flex flex-col md:flex-row items-center gap-6">
            {totalExpenseSum === 0 ? (
              <div className="w-full text-center py-8 text-xs text-slate-400 font-medium">
                No recorded expense transactions to visualize.
              </div>
            ) : (
              <>
                {/* Donut graphic */}
                <div className="relative w-40 h-40 flex-shrink-0 select-none">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={donutRadius}
                      className="fill-none stroke-slate-50"
                      strokeWidth="12"
                    />

                    {donutSegments.map((segment) => {
                      const isHovered = hoveredCategory === segment.category;

                      return (
                        <circle
                          key={segment.category}
                          cx="60"
                          cy="60"
                          r={donutRadius}
                          className="fill-none transition-all duration-300"
                          style={{
                            stroke: segment.color,
                            strokeWidth: isHovered ? "16" : "12",
                          }}
                          strokeWidth="12"
                          strokeDasharray={`${segment.strokeLength} ${circumference}`}
                          strokeDashoffset={segment.strokeOffset}
                          strokeLinecap="round"
                          onMouseEnter={() => setHoveredCategory(segment.category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Inner information circle */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                    {displayedCategoryDetail ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                          {displayedCategoryDetail.category}
                        </span>
                        <span className="text-sm font-extrabold text-slate-800 font-mono block leading-tight">
                          ${displayedCategoryDetail.amount.toFixed(0)}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-500 block leading-none">
                          {displayedCategoryDetail.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                          Expensed
                        </span>
                        <span className="text-base font-extrabold text-slate-800 font-mono block leading-tight">
                          ${totalExpenseSum.toFixed(0)}
                        </span>
                        <span className="text-[9px] text-slate-400 block leading-none">
                          May Total
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side list legend */}
                <div className="flex-1 w-full space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {categoryShareData.map((item) => {
                    const isHovered = hoveredCategory === item.category;

                    return (
                      <div
                        key={item.category}
                        className={`flex items-center justify-between p-1.5 rounded-lg border transition-all text-xs cursor-pointer ${
                          isHovered
                            ? "bg-slate-50 border-slate-200 shadow-xs scale-[1.01]"
                            : "bg-white border-transparent hover:bg-slate-5 /30"
                        }`}
                        onMouseEnter={() => setHoveredCategory(item.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-bold text-slate-700 truncate">{item.category}</span>
                        </div>

                        <div className="text-right shrink-0 pl-2 font-mono">
                          <span className="font-extrabold text-slate-800">${item.amount.toFixed(0)}</span>
                          <span className="text-slate-400 font-medium text-[10px] ml-1.5">
                            {item.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
