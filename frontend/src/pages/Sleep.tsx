import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SleepTracker from "../components/SleepTracker";
import { apiService } from "../services/api";
import { useApi } from "../hooks/useApi";
import { SleepEntry, CreateSleepData } from "../services/types";

const Sleep = () => {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const navigate = useNavigate();

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

  const handleAddSleepEntry = async (entryData: {
    checkIn: string;
    checkOut?: string;
    duration?: number;
    notes?: string;
    quality?: 1 | 2 | 3 | 4 | 5;
    date: string;
    isActive?: boolean;
  }) => {
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

  const handleAddJournalEntry = async (entry: {
    title: string;
    content: string;
    tags: string[];
    date: string;
  }) => {
    try {
      await apiService.createJournalEntry(entry);
      // Optionally navigate to journal page or show success message
    } catch (error) {
      console.error("Failed to create journal entry:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {fetchSleepEntries.loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading sleep data...</p>
            </div>
          </div>
        ) : fetchSleepEntries.error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Error loading sleep data
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                {fetchSleepEntries.error.message ||
                  "Failed to load sleep data. Please try again."}
              </p>
              <button
                onClick={handleFetchSleepEntries}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
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
      </div>
    </div>
  );
};

export default Sleep;
