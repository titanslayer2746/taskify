import React, { useState, useEffect } from "react";
import PaperPage, {
  PaperErrorState,
  PaperLoading,
} from "../components/paper/PaperPage";
import SleepTracker from "../components/SleepTracker";
import { apiService } from "../services/api";
import { useApi } from "../hooks/useApi";
import {
  SleepEntry,
  CreateSleepData,
  SleepJournalEntryInput,
} from "../services/types";

const Sleep = () => {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);

  console.log(
    "Sleep component rendering, sleepEntries length:",
    sleepEntries.length
  );

  // API hooks
  const fetchSleepEntries = useApi(apiService.getSleepEntries);
  const createSleepEntry = useApi(apiService.createSleepEntry);
  const updateSleepEntry = useApi(apiService.updateSleepEntry);
  const deleteSleepEntry = useApi(apiService.deleteSleepEntry);

  // Fetch sleep entries on component mount
  useEffect(() => {
    console.log("Sleep component mounted - fetching sleep entries");
    handleFetchSleepEntries();
  }, []);

  const handleFetchSleepEntries = async () => {
    console.log("handleFetchSleepEntries called");
    try {
      const response = await fetchSleepEntries.execute();
      console.log("Sleep entries fetched:", response);
      if (response.success && response.data) {
        // Handle both paginated and non-paginated responses
        const entries = Array.isArray(response.data)
          ? response.data
          : response.data.entries || [];
        setSleepEntries(entries);
      }
    } catch (error) {
      console.error("Failed to fetch sleep entries:", error);
    }
  };

  const handleAddSleepEntry = async (entryData: CreateSleepData) => {
    try {
      const response = await createSleepEntry.execute(entryData);
      if (response.success && response.data) {
        const newEntry = response.data.entry || response.data;
        setSleepEntries((prev) => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error("Failed to create sleep entry:", error);
    }
  };

  const handleUpdateSleepEntry = async (
    entryId: string,
    updateData: Partial<CreateSleepData>
  ) => {
    console.log("handleUpdateSleepEntry called with:", { entryId, updateData });
    try {
      const response = await updateSleepEntry.execute(entryId, updateData);
      console.log("Update response:", response);
      if (response.success && response.data) {
        const updatedEntry = response.data.entry || response.data;
        console.log("Updating sleepEntries with:", updatedEntry);
        setSleepEntries((prev) => {
          const newEntries = prev.map((entry) =>
            entry.id === entryId ? updatedEntry : entry
          );
          console.log("New sleepEntries:", newEntries);
          return newEntries;
        });
        return response;
      }
    } catch (error) {
      console.error("Failed to update sleep entry:", error);
      throw error;
    }
  };

  const handleDeleteSleepEntry = async (entryId: string) => {
    try {
      const response = await deleteSleepEntry.execute(entryId);
      if (response.success) {
        setSleepEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      }
    } catch (error) {
      console.error("Failed to delete sleep entry:", error);
    }
  };

  const handleAddJournalEntry = async (entry: SleepJournalEntryInput) => {
    try {
      await apiService.createJournalEntry(entry);
      // Optionally navigate to journal page or show success message
    } catch (error) {
      console.error("Failed to create journal entry:", error);
    }
  };

  return (
    <PaperPage number="06" title="Sleep" subtitle="Bedtimes, wake-ups, and how it felt.">
      {fetchSleepEntries.loading ? (
        <PaperLoading label="Opening your nights…" />
      ) : fetchSleepEntries.error ? (
        <PaperErrorState
          message={
            fetchSleepEntries.error.message ||
            "Your sleep log didn't load. Please try again."
          }
          onRetry={handleFetchSleepEntries}
        />
      ) : (
        <SleepTracker
          sleepEntries={sleepEntries}
          onAddSleepEntry={handleAddSleepEntry}
          onUpdateSleepEntry={handleUpdateSleepEntry}
          onDeleteSleepEntry={handleDeleteSleepEntry}
          onAddJournalEntry={handleAddJournalEntry}
          isLoading={
            createSleepEntry.loading ||
            updateSleepEntry.loading ||
            deleteSleepEntry.loading
          }
        />
      )}
    </PaperPage>
  );
};

export default Sleep;
