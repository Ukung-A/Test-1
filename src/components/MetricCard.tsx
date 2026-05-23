import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownRight, Percent, DollarSign } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  type: "currency" | "percentage";
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon: React.ReactNode;
  theme: "emerald" | "rose" | "indigo" | "cyan";
}

export function MetricCard({ title, value, type, trend, icon, theme }: MetricCardProps) {
  const formatValue = (val: number) => {
    if (type === "percentage") {
      return `${val.toFixed(1)}%`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case "emerald":
        return {
          bg: "bg-emerald-50/50 border-emerald-100/80",
          iconBg: "bg-emerald-100 text-emerald-600",
          text: "text-emerald-700",
          accent: "border-emerald-500"
        };
      case "rose":
        return {
          bg: "bg-rose-50/50 border-rose-100/80",
          iconBg: "bg-rose-100 text-rose-600",
          text: "text-rose-700",
          accent: "border-rose-500"
        };
      case "indigo":
        return {
          bg: "bg-indigo-50/50 border-indigo-100/80",
          iconBg: "bg-indigo-100 text-indigo-600",
          text: "text-indigo-700",
          accent: "border-indigo-500"
        };
      case "cyan":
        return {
          bg: "bg-cyan-50/50 border-cyan-100/80",
          iconBg: "bg-cyan-100 text-cyan-600",
          text: "text-cyan-700",
          accent: "border-cyan-500"
        };
    }
  };

  const classes = getThemeClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-3xl border shadow-xs flex flex-col justify-between h-36 transition-all duration-300 hover:shadow-sm hover:scale-[1.01] ${classes.bg}`}
      id={`metric-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {/* Aesthetic color accents */}
      <div className={`absolute top-0 left-0 w-1 h-full ${classes.accent}`} />

      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`rounded-xl p-2.5 ${classes.iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {formatValue(value)}
        </h3>

        {trend && (
          <div className="flex items-center space-x-1">
            <span
              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
              )}
              {trend.value}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
