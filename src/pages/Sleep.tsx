import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SleepTracker from "../components/SleepTracker";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const Sleep = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEntries = localStorage.getItem("journalEntries");
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
  }, [journalEntries]);

  const handleAddJournalEntry = (entry: {
    title: string;
    content: string;
    tags: string[];
    date: string;
  }) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: entry.title,
      content: entry.content,
      tags: entry.tags,
      createdAt: entry.date,
      updatedAt: entry.date,
    };
    setJournalEntries((prev) => [newEntry, ...prev]);

    // Navigate to the specific journal entry after adding entry
    setTimeout(() => {
      navigate(`/journal/${newEntry.id}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SleepTracker onAddJournalEntry={handleAddJournalEntry} />
      </div>
    </div>
  );
};

export default Sleep;
