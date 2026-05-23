import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SavingGoal } from "../types";
import { Plus, PiggyBank, Target, Calendar, Trash2, ArrowUpRight, ArrowDownRight, Check, X } from "lucide-react";

interface GoalsSectionProps {
  goals: SavingGoal[];
  onAddGoal: (name: string, target: number, current: number) => void;
  onUpdateGoalProgress: (id: string, amount: number) => void; // amount can be positive (save) or negative (withdraw)
  onDeleteGoal: (id: string) => void;
}

export function GoalsSection({ goals, onAddGoal, onUpdateGoalProgress, onDeleteGoal }: GoalsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");

  // Keep track of which goal is currently receiving a quick deposit/withdrawal
  const [activeAdjustingGoal, setActiveAdjustingGoal] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<"deposit" | "withdraw">("deposit");

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(target);
    const currentNum = parseFloat(current) || 0;
    if (name.trim() && !isNaN(targetNum) && targetNum > 0) {
      onAddGoal(name.trim(), targetNum, currentNum);
      setName("");
      setTarget("");
      setCurrent("");
      setShowAddForm(false);
    }
  };

  const handleAdjustGoal = (id: string) => {
    const amount = parseFloat(adjustAmount);
    if (!isNaN(amount) && amount > 0) {
      const multiplier = adjustType === "deposit" ? 1 : -1;
      onUpdateGoalProgress(id, amount * multiplier);
      setAdjustAmount("");
      setActiveAdjustingGoal(null);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs flex flex-col h-full transition-all duration-300 hover:shadow-sm" id="saving-goals-section">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Savings Goals</h2>
          <p className="text-xs text-slate-400">Put aside funds for specific long-term milestone items</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
            showAddForm
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          }`}
          id="toggle-add-goal"
        >
          {showAddForm ? (
            <>
              <X className="w-3.5 h-3.5" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Define Goal
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmitGoal}
            className="mb-4 p-4 border border-indigo-50/60 rounded-xl bg-indigo-50/20 space-y-3 overflow-hidden"
            id="add-goal-form"
          >
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Goal Name</label>
              <input
                type="text"
                placeholder="e.g., Emergency Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                id="goal-input-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Amount ($)</label>
                <input
                  type="number"
                  placeholder="2500"
                  min="1"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  id="goal-input-target"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Starting Saved ($)</label>
                <input
                  type="number"
                  placeholder="500"
                  min="0"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  id="goal-input-current"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              id="submit-new-goal"
            >
              Add Goal
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1 max-h-[350px]">
        {goals.map((goal) => {
          const pct = Math.min((goal.current / goal.target) * 100, 100);
          const isCompleted = goal.current >= goal.target;

          return (
            <div key={goal.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200/80 bg-white shadow-xs relative group transition-all" id={`goal-card-${goal.id}`}>
              {/* Outer Delete button */}
              <button
                onClick={() => onDeleteGoal(goal.id)}
                className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-md transition-all"
                title="Delete goal"
                id={`delete-goal-${goal.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start space-x-3 pr-6 mb-2">
                <div className={`p-2.5 rounded-lg ${isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}>
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-800 leading-snug truncate">{goal.name}</h4>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="text-xs font-semibold text-slate-700 font-mono">${goal.current.toLocaleString()}</span>
                    <span className="text-[11px] text-slate-400">saved of</span>
                    <span className="text-xs font-semibold text-slate-700 font-mono">${goal.target.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-indigo-500"}`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className={isCompleted ? "text-emerald-600" : "text-indigo-600"}>
                  {pct.toFixed(0)}% Completed
                </span>

                <span className="text-slate-400 font-medium">
                  {isCompleted ? "Completed!" : `Remaining: $${(goal.target - goal.current).toLocaleString()}`}
                </span>
              </div>

              {/* Deposit/Withdraw fast widget */}
              <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                {activeAdjustingGoal === goal.id ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => setAdjustType(adjustType === "deposit" ? "withdraw" : "deposit")}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                        adjustType === "deposit"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {adjustType === "deposit" ? "Add" : "Deduct"}
                    </button>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="w-20 px-2 py-1 text-xs font-mono border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAdjustGoal(goal.id)}
                      className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                      title="Apply change"
                      id={`apply-progress-${goal.id}`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveAdjustingGoal(null)}
                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end w-full gap-2">
                    <button
                      onClick={() => {
                        setActiveAdjustingGoal(goal.id);
                        setAdjustType("deposit");
                      }}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 px-2 py-1 rounded-md transition-all flex items-center gap-0.5"
                      id={`deposit-button-${goal.id}`}
                    >
                      <ArrowUpRight className="w-3 h-3" /> Deposit
                    </button>
                    <button
                      onClick={() => {
                        setActiveAdjustingGoal(goal.id);
                        setAdjustType("withdraw");
                      }}
                      disabled={goal.current <= 0}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-50 px-2 py-1 rounded-md transition-all flex items-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                      id={`withdraw-button-${goal.id}`}
                    >
                      <ArrowDownRight className="w-3 h-3" /> Withdraw
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="py-8 text-center text-slate-400">
            <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span className="text-xs">No saving goals specified yet. Create one above!</span>
          </div>
        )}
      </div>
    </div>
  );
}
