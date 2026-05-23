import { Transaction, Budget, SavingGoal } from "./types";

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    type: "income",
    category: "Salary",
    amount: 4200.00,
    date: "2026-05-01",
    description: "Monthly Tech Corp Salary"
  },
  {
    id: "tx-2",
    type: "expense",
    category: "Housing",
    amount: 1400.00,
    date: "2026-05-01",
    description: "Apartment Rent & Service Fee"
  },
  {
    id: "tx-3",
    type: "expense",
    category: "Food",
    amount: 135.20,
    date: "2026-05-04",
    description: "Whole Foods Weekly Groceries"
  },
  {
    id: "tx-4",
    type: "expense",
    category: "Utilities",
    amount: 112.50,
    date: "2026-05-07",
    description: "Electric & Water Utilities"
  },
  {
    id: "tx-5",
    type: "expense",
    category: "Health",
    amount: 60.00,
    date: "2026-05-08",
    description: "Equinox Gym Membership"
  },
  {
    id: "tx-6",
    type: "expense",
    category: "Utilities",
    amount: 79.99,
    date: "2026-05-10",
    description: "High-Speed Fiber Internet"
  },
  {
    id: "tx-7",
    type: "income",
    category: "Freelance",
    amount: 850.00,
    date: "2026-05-12",
    description: "Web Design Project - UI/UX"
  },
  {
    id: "tx-8",
    type: "expense",
    category: "Food",
    amount: 92.40,
    date: "2026-05-14",
    description: "Dinner out with friends"
  },
  {
    id: "tx-9",
    type: "expense",
    category: "Entertainment",
    amount: 45.00,
    date: "2026-05-16",
    description: "Cinema tickets & popcorn"
  },
  {
    id: "tx-10",
    type: "expense",
    category: "Transport",
    amount: 42.00,
    date: "2026-05-18",
    description: "Monthly train transit pass"
  },
  {
    id: "tx-11",
    type: "expense",
    category: "Shopping",
    amount: 189.99,
    date: "2026-05-20",
    description: "Mechanical Keyboard Upgrade"
  },
  {
    id: "tx-12",
    type: "expense",
    category: "Food",
    amount: 16.50,
    date: "2026-05-22",
    description: "Specialty cafe espresso & pastry"
  },
  {
    id: "tx-13",
    type: "income",
    category: "Investments",
    amount: 125.00,
    date: "2026-05-23",
    description: "Quarterly stock dividend payment"
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { category: "Housing", limit: 1500 },
  { category: "Food", limit: 500 },
  { category: "Utilities", limit: 250 },
  { category: "Transport", limit: 150 },
  { category: "Entertainment", limit: 150 },
  { category: "Shopping", limit: 300 },
  { category: "Health", limit: 100 },
  { category: "Other", limit: 200 }
];

export const INITIAL_GOALS: SavingGoal[] = [
  {
    id: "goal-1",
    name: "Emergency Rainy Day Fund",
    target: 12000,
    current: 6800
  },
  {
    id: "goal-2",
    name: "Japan Summer Trip 2027",
    target: 4500,
    current: 2100
  },
  {
    id: "goal-3",
    name: "Custom Workspace Setup",
    target: 2500,
    current: 1350
  }
];

export const AVAILABLE_EXPENSE_CATEGORIES = [
  "Housing",
  "Food",
  "Utilities",
  "Transport",
  "Entertainment",
  "Shopping",
  "Health",
  "Other"
];

export const AVAILABLE_INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Gifts",
  "Other"
];

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#4f46e5", // indigo-600
  Food: "#10b981", // emerald-500
  Utilities: "#06b6d4", // cyan-500
  Transport: "#f59e0b", // amber-500
  Entertainment: "#ec4899", // pink-500
  Shopping: "#8b5cf6", // violet-500
  Health: "#ef4444", // red-500
  Other: "#6b7280", // gray-500
  // Income sources
  Salary: "#10b981", // emerald-500
  Freelance: "#8b5cf6", // violet-500
  Investments: "#3b82f6", // blue-500
  Gifts: "#ec4899", // pink-500
};
