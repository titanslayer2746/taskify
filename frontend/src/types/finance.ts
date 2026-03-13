import type { FinanceEntry as ServiceFinanceEntry } from "@/services/types";
import type React from "react";

export type FinanceEntry = ServiceFinanceEntry;
export type FinanceType = FinanceEntry["type"];

export interface FinanceCardProps {
  entry: FinanceEntry;
  onDelete: (id: string) => void;
  onCopy: (entry: FinanceEntry) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
}

export type FinanceModalSubmitData = Omit<
  FinanceEntry,
  "id" | "createdAt" | "updatedAt"
>;

export interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (entry: FinanceModalSubmitData) => void;
  copyFrom?: FinanceEntry | null;
}

export interface FinanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  entries: FinanceEntry[];
}

export interface FinanceStatsProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface FinancePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

