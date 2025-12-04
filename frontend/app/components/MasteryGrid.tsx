/**
 * MasteryGrid.tsx - Visual Mastery Display Component
 *
 * Displays all flashcards in a grid with color-coded mastery levels.
 * Visualizes how Bayesian updates affect card probabilities over time.
 *
 * Color Scale:
 *   - 0.0 (red)    → Low mastery, likely to miss
 *   - 0.5 (yellow) → Medium mastery, uncertain
 *   - 1.0 (green)  → High mastery, likely to know
 *
 * Parent: /progress/page.tsx
 * Children: None
 *
 * Props: None
 *
 * UI Components: Uses shadcn Button for refresh button
 *
 * API Endpoints Used:
 *   - GET /api/all_cards: Fetches all cards with their mastery values
 *
 * CSS: Uses Tailwind with inline HSL color interpolation for smooth gradients.
 *      Grid is responsive: 4 columns on desktop, fewer on mobile.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "../lib/api";
import { Button } from "@/components/ui/button";

interface CardMastery {
  id: number;
  question: string;
  mastery: number;
}

export default function MasteryGrid() {
  const [cards, setCards] = useState<CardMastery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * fetchCards - Fetches all cards with mastery from backend
   *
   * Calls GET /api/all_cards endpoint.
   * Updates cards state with fetched data.
   */
  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/all_cards"));

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cards");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  /**
   * getMasteryColor - Converts mastery (0-1) to HSL color
   *
   * Uses HSL color space for smooth interpolation:
   *   - 0.0 → Hue 0° (red)
   *   - 0.5 → Hue 60° (yellow)
   *   - 1.0 → Hue 120° (green)
   *
   * Input:
   *   - mastery: number between 0 and 1
   *
   * Output:
   *   - string: HSL color value
   */
  function getMasteryColor(mastery: number): string {
    // Clamp mastery between 0 and 1
    const clamped = Math.max(0, Math.min(1, mastery));
    // Map 0-1 to hue 0-120 (red to green through yellow)
    const hue = clamped * 120;
    // Use higher saturation and appropriate lightness for visibility
    return `hsl(${hue}, 75%, 45%)`;
  }

  /**
   * getMasteryBackgroundColor - Lighter version for card background
   */
  function getMasteryBackgroundColor(mastery: number): string {
    const clamped = Math.max(0, Math.min(1, mastery));
    const hue = clamped * 120;
    return `hsl(${hue}, 70%, 92%)`;
  }

  /**
   * truncateText - Truncates text to specified length
   */
  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + "…";
  }

  return (
    <div className="w-full max-w-lg bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          Mastery Grid
        </h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchCards}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Color Legend */}
      <div className="flex items-center gap-2 mb-4 text-xs text-zinc-600 dark:text-zinc-400">
        <span>Low</span>
        <div
          className="flex-1 h-3 rounded-full"
          style={{
            background: "linear-gradient(to right, hsl(0, 75%, 45%), hsl(60, 75%, 45%), hsl(120, 75%, 45%))",
          }}
        />
        <span>High</span>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-md text-red-700 dark:text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && cards.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-zinc-600 dark:text-zinc-400">
            No cards yet. Add some cards to see mastery levels!
          </p>
        </div>
      )}

      {/* Card Grid */}
      {cards.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 cursor-default transition-transform hover:scale-105 group"
              style={{
                backgroundColor: getMasteryBackgroundColor(card.mastery),
                border: `2px solid ${getMasteryColor(card.mastery)}`,
              }}
              title={`${card.question}\nMastery: ${(card.mastery * 100).toFixed(0)}%`}
            >
              {/* Mastery percentage */}
              <span
                className="text-lg font-bold"
                style={{ color: getMasteryColor(card.mastery) }}
              >
                {(card.mastery * 100).toFixed(0)}%
              </span>
              
              {/* Card ID */}
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                #{card.id}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {truncateText(card.question, 30)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {cards.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Total Cards: {cards.length}</span>
            <span>
              Avg Mastery:{" "}
              {(
                (cards.reduce((sum, c) => sum + c.mastery, 0) / cards.length) *
                100
              ).toFixed(0)}
              %
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

