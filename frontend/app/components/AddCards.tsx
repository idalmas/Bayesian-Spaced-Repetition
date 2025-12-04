/**
 * AddCards.tsx - Flashcard Input Form Component
 *
 * A form component for adding new flashcards to the spaced repetition system.
 * Supports two modes:
 *   1. Single Card: Manual entry of one card at a time
 *   2. Bulk Import: Paste JSON or upload a .json file to add multiple cards
 *
 * POSTs card data (front/back) to the backend /api/add_cards endpoint.
 *
 * Parent: /add/page.tsx (or any page that needs card creation)
 * Children: None
 *
 * Props: None
 *
 * UI Components: Uses shadcn Button for all interactive buttons
 *
 * CSS: Uses Tailwind utility classes. Container is a white card with shadow,
 *      max-width of lg (32rem), with padding and rounded corners.
 *      Tabs use ghost variant buttons with border-bottom for active state.
 */

"use client";

import { useState, useRef } from "react";
import { apiUrl } from "../lib/api";
import { Button } from "@/components/ui/button";

type Mode = "single" | "bulk";
type StatusType = "idle" | "loading" | "success" | "error";

interface Status {
  type: StatusType;
  message: string;
}

interface Card {
  front: string;
  back: string;
}

export default function AddCards() {
  const [mode, setMode] = useState<Mode>("single");

  // Single card state
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // Bulk import state
  const [jsonInput, setJsonInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared status
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });

  /**
   * parseCardsFromJson - Parses JSON input into an array of cards
   *
   * Accepts two formats:
   *   1. Array format: [{ "front": "...", "back": "..." }, ...]
   *   2. Object format: { "cards": [{ "front": "...", "back": "..." }, ...] }
   *
   * Input:
   *   - jsonString: string - Raw JSON string
   *
   * Output:
   *   - Card[] - Array of card objects with front/back properties
   *
   * Throws:
   *   - Error if JSON is invalid or doesn't match expected format
   */
  function parseCardsFromJson(jsonString: string): Card[] {
    const parsed = JSON.parse(jsonString);

    let cards: unknown[];

    if (Array.isArray(parsed)) {
      cards = parsed;
    } else if (parsed.cards && Array.isArray(parsed.cards)) {
      cards = parsed.cards;
    } else {
      throw new Error("JSON must be an array of cards or an object with a 'cards' array");
    }

    // Validate each card has front and back
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as Record<string, unknown>;
      if (typeof card.front !== "string" || typeof card.back !== "string") {
        throw new Error(`Card at index ${i} is missing 'front' or 'back' string property`);
      }
      if (!card.front.trim() || !card.back.trim()) {
        throw new Error(`Card at index ${i} has empty 'front' or 'back' value`);
      }
    }

    return cards as Card[];
  }

  /**
   * submitCards - Sends card array to the backend
   *
   * Input:
   *   - cards: Card[] - Array of cards to submit
   *
   * Output:
   *   - Promise<boolean> - true if successful, false otherwise
   */
  async function submitCards(cards: Card[]): Promise<boolean> {
    const response = await fetch(apiUrl("/api/add_cards"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cards }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error("Unexpected response from server");
    }

    return true;
  }

  /**
   * handleSingleSubmit - Handles single card form submission
   */
  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!front.trim() || !back.trim()) {
      setStatus({ type: "error", message: "Both front and back are required" });
      return;
    }

    setStatus({ type: "loading", message: "Adding card..." });

    try {
      await submitCards([{ front, back }]);
      setStatus({ type: "success", message: "Card added successfully!" });
      setFront("");
      setBack("");
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to add card",
      });
    }
  }

  /**
   * handleBulkSubmit - Handles bulk JSON import submission
   */
  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!jsonInput.trim()) {
      setStatus({ type: "error", message: "Please paste JSON or upload a file" });
      return;
    }

    setStatus({ type: "loading", message: "Parsing and adding cards..." });

    try {
      const cards = parseCardsFromJson(jsonInput);

      if (cards.length === 0) {
        throw new Error("No cards found in JSON");
      }

      await submitCards(cards);
      setStatus({
        type: "success",
        message: `Successfully added ${cards.length} card${cards.length > 1 ? "s" : ""}!`,
      });
      setJsonInput("");
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to parse or add cards",
      });
    }
  }

  /**
   * handleFileUpload - Reads uploaded JSON file into the textarea
   */
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setJsonInput(content);
        setStatus({ type: "idle", message: "" });
      }
    };
    reader.onerror = () => {
      setStatus({ type: "error", message: "Failed to read file" });
    };
    reader.readAsText(file);

    // Reset file input so same file can be re-uploaded
    e.target.value = "";
  }

  /**
   * clearStatus - Clears status when switching tabs
   */
  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setStatus({ type: "idle", message: "" });
  }

  return (
    <div className="w-full max-w-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6">
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
        Add Flashcards
      </h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => handleModeChange("single")}
          className={`rounded-none ${
            mode === "single"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          Single Card
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => handleModeChange("bulk")}
          className={`rounded-none ${
            mode === "bulk"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          Bulk Import
        </Button>
      </div>

      {/* Single Card Form */}
      {mode === "single" && (
        <form onSubmit={handleSingleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="front"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Front (Question)
            </label>
            <textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter the question..."
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="back"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Back (Answer)
            </label>
            <textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter the answer..."
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={status.type === "loading"}
            className="w-full"
          >
            {status.type === "loading" ? "Adding..." : "Add Card"}
          </Button>
        </form>
      )}

      {/* Bulk Import Form */}
      {mode === "bulk" && (
        <form onSubmit={handleBulkSubmit} className="flex flex-col gap-4">
          {/* JSON Format Instructions */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            <p className="mb-2 font-sans font-medium text-zinc-700 dark:text-zinc-300">
              Accepted JSON formats:
            </p>
            <pre className="whitespace-pre-wrap">
{`// Array format:
[
  { "front": "Question 1", "back": "Answer 1" },
  { "front": "Question 2", "back": "Answer 2" }
]

// Or object format:
{
  "cards": [
    { "front": "Q1", "back": "A1" }
  ]
}`}
            </pre>
          </div>

          <div>
            <label
              htmlFor="json-input"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Paste JSON
            </label>
            <textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{ "front": "...", "back": "..." }]'
              rows={8}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>

          {/* File Upload */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">or</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload .json file
            </Button>
          </div>

          <Button
            type="submit"
            disabled={status.type === "loading"}
            className="w-full"
          >
            {status.type === "loading" ? "Importing..." : "Import Cards"}
          </Button>
        </form>
      )}

      {/* Status message */}
      {status.type !== "idle" && status.type !== "loading" && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            status.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
