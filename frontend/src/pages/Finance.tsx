import React, { useState, useEffect } from "react";
import PaperPage, {
  PaperEmpty,
  PaperErrorState,
  PaperLoading,
  SectionHeading,
} from "../components/paper/PaperPage";
import { PaperButton } from "../components/paper/PaperDialog";
import { paperIconButton, paperSelect } from "@/lib/paper";
import FinanceModal from "../components/FinanceModal";
import FinanceCard from "../components/FinanceCard";
import FinanceStats from "../components/FinanceStats";
import FinanceDashboard from "../components/FinanceDashboard";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { apiService } from "../services/api";
import { useApi } from "../hooks/useApi";
import { CreateFinanceData, FinanceEntry, FinancePagination } from "../services/types";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

const Finance = () => {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [analyticsEntries, setAnalyticsEntries] = useState<FinanceEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToCopy, setEntryToCopy] = useState<FinanceEntry | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [sortBy, setSortBy] = useState<"date" | "amount" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState<FinancePagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    entryId: string | null;
    entryTitle: string;
  }>({
    isOpen: false,
    entryId: null,
    entryTitle: "",
  });

  // API hooks
  const fetchEntries = useApi(apiService.getFinanceEntries);
  const fetchAnalyticsEntries = useApi(apiService.getFinanceEntries);
  const createEntry = useApi(apiService.createFinanceEntry);
  const deleteEntry = useApi(apiService.deleteFinanceEntry);

  const applyPagination = (
    incoming: Partial<FinancePagination> | undefined,
    fallbackCount: number,
  ) => {
    if (incoming) {
      const page = incoming.page ?? currentPage;
      const limit = incoming.limit ?? pageSize;
      const total = incoming.total ?? fallbackCount;
      const totalPages =
        incoming.totalPages ?? Math.max(1, Math.ceil(total / limit));

      setPagination({
        page,
        limit,
        total,
        totalPages,
        hasNext: incoming.hasNext ?? page < totalPages,
        hasPrev: incoming.hasPrev ?? page > 1,
      });
      return;
    }

    setPagination({
      page: 1,
      limit: fallbackCount || pageSize,
      total: fallbackCount,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  };

  const loadEntries = async () => {
    const params = {
      type: filterType === "all" ? undefined : filterType,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: pageSize,
    };

    const result = await fetchEntries.execute(params);
    if (result?.data) {
      const payload = result.data as any;
      const nextEntries = Array.isArray(payload.entries)
        ? payload.entries
        : Array.isArray(payload.data)
        ? payload.data
        : [];

      const incomingPagination = payload.pagination as
        | Partial<FinancePagination>
        | undefined;
      const incomingTotalPages = incomingPagination?.totalPages ?? 1;

      // If current page is now out of range (e.g. deleting last item on last page),
      // jump to the last valid page and let the effect refetch.
      if (
        incomingPagination &&
        currentPage > incomingTotalPages &&
        incomingTotalPages >= 1
      ) {
        setCurrentPage(incomingTotalPages);
        return;
      }

      setEntries(nextEntries);
      applyPagination(incomingPagination, nextEntries.length);
      return;
    }

    setEntries([]);
    applyPagination(undefined, 0);
  };

  const loadAnalyticsEntries = async () => {
    const result = await fetchAnalyticsEntries.execute({
      sortBy: "date",
      sortOrder: "desc",
    });

    if (result?.data) {
      const payload = result.data as any;
      const nextEntries = Array.isArray(payload.entries)
        ? payload.entries
        : Array.isArray(payload.data)
        ? payload.data
        : [];
      setAnalyticsEntries(nextEntries);
      return;
    }

    setAnalyticsEntries([]);
  };

  // Fetch entries on component mount and whenever server-side filters/sort change
  useEffect(() => {
    loadEntries();
  }, [filterType, sortBy, sortOrder, currentPage, pageSize]);

  useEffect(() => {
    loadAnalyticsEntries();
  }, []);

  const addEntry = async (
    entryData: Omit<FinanceEntry, "id" | "createdAt" | "updatedAt">,
  ) => {
    const createData: CreateFinanceData = {
      title: entryData.title,
      type: entryData.type,
      category: entryData.category,
      amount: entryData.amount,
      tags: entryData.tags,
      date: entryData.date,
      description: entryData.description,
    };

    const result = await createEntry.execute(createData);
    if (result?.data?.entry) {
      await loadEntries();
      await loadAnalyticsEntries();
      setIsModalOpen(false);
      setEntryToCopy(null);
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirmation({
      isOpen: true,
      entryId: id,
      entryTitle: title,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.entryId) {
      const result = await deleteEntry.execute(deleteConfirmation.entryId);
      if (result) {
        await loadEntries();
        await loadAnalyticsEntries();
      }
    }
    setDeleteConfirmation({
      isOpen: false,
      entryId: null,
      entryTitle: "",
    });
  };

  const copyEntry = (entry: FinanceEntry) => {
    setEntryToCopy(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEntryToCopy(null);
  };

  const totalIncome = analyticsEntries
    .filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = analyticsEntries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const balance = totalIncome - totalExpenses;

  const closeDeleteConfirmation = () =>
    setDeleteConfirmation({ isOpen: false, entryId: null, entryTitle: "" });

  const filterLabels = { all: "All", income: "Money in", expense: "Money out" };

  return (
    <PaperPage
      number="05"
      title="Money"
      subtitle="What came in, what went out."
      actions={
        <PaperButton onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          New entry
        </PaperButton>
      }
    >
      <FinanceStats
        balance={balance}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />

      <FinanceDashboard entries={analyticsEntries} />

      {/* Ledger */}
      <section aria-labelledby="ledger-heading" className="mt-20">
        <SectionHeading id="ledger-heading" kicker="The ledger" title="Every entry." />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <div role="tablist" aria-label="Filter entries" className="flex gap-6">
            {(["all", "income", "expense"] as const).map((type) => (
              <button
                key={type}
                role="tab"
                aria-selected={filterType === type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentPage(1);
                }}
                className={`paper-focus relative pb-1 text-[15px] ${
                  filterType === type
                    ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-clay"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {filterLabels[type]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label>
              <span className="sr-only">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as "date" | "amount" | "title");
                  setCurrentPage(1);
                }}
                className={`${paperSelect} w-auto py-1 text-[15px]`}
              >
                <option value="date">By date</option>
                <option value="amount">By amount</option>
                <option value="title">By name</option>
              </select>
            </label>
            <button
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                setCurrentPage(1);
              }}
              className={paperIconButton}
              aria-label={
                sortOrder === "asc" ? "Sorted ascending — switch to descending" : "Sorted descending — switch to ascending"
              }
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? <ArrowUpNarrowWide size={18} /> : <ArrowDownWideNarrow size={18} />}
            </button>
            <label className="flex items-center gap-2">
              <span className="font-ledger text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                Show
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`${paperSelect} w-auto py-1 text-[15px]`}
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {fetchEntries.loading ? (
          <PaperLoading label="Opening the ledger…" />
        ) : fetchEntries.error ? (
          <PaperErrorState
            message={
              fetchEntries.error.message ||
              "The entries didn't load. Please try again."
            }
            onRetry={loadEntries}
          />
        ) : entries.length === 0 ? (
          <PaperEmpty
            title="An empty ledger."
            body="Log what comes in and what goes out, and the totals and trend fill themselves in."
            action={
              <PaperButton onClick={() => setIsModalOpen(true)}>
                <Plus size={16} />
                Add your first entry
              </PaperButton>
            }
          />
        ) : (
          <>
            <ul className="mt-3 border-t border-ink">
              {entries.map((entry) => (
                <FinanceCard
                  key={entry.id}
                  entry={entry}
                  onDelete={(id) => handleDeleteClick(id, entry.title)}
                  onCopy={copyEntry}
                />
              ))}
            </ul>

            <nav
              aria-label="Pages"
              className="mt-6 flex flex-wrap items-center justify-between gap-3"
            >
              <p className="font-ledger text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                Page {pagination.page} of {pagination.totalPages}
                {pagination.total > 0 ? ` · ${pagination.total} entries` : ""}
              </p>
              <div className="flex items-center gap-2">
                <PaperButton
                  tone="quiet"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrev || fetchEntries.loading}
                >
                  <ChevronLeft size={16} />
                  Previous
                </PaperButton>
                <PaperButton
                  tone="quiet"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      pagination.totalPages > 0
                        ? Math.min(pagination.totalPages, prev + 1)
                        : prev + 1
                    )
                  }
                  disabled={!pagination.hasNext || fetchEntries.loading}
                >
                  Next
                  <ChevronRight size={16} />
                </PaperButton>
              </div>
            </nav>
          </>
        )}
      </section>

      <FinanceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={addEntry}
        copyFrom={entryToCopy}
      />

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Delete this entry?"
        message={`“${deleteConfirmation.entryTitle}” will be taken out of the ledger for good.`}
        confirmText="Delete"
        cancelText="Keep it"
        type="danger"
      />
    </PaperPage>
  );
};

export default Finance;
