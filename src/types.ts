export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface SavingGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  category?: string;
}

export type SortField = "date" | "amount";
export type SortOrder = "asc" | "desc";
