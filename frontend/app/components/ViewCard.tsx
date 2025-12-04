/**
 * ViewCard.tsx - Flashcard Review Component
 *
 * A component for reviewing flashcards using spaced repetition.
 * Fetches the next card from the backend, displays question/answer,
 * and records user responses (correct/incorrect).
 *
 * Flow:
 *   1. Click "Start Studying" to fetch first card
 *   2. Read the question, think of answer
 *   3. Click "Show Answer" to reveal
 *   4. Click "Got it" (correct) or "Missed it" (incorrect)
 *   5. Automatically fetches next card
 *
 * Parent: page.tsx (home page)
 * Children: None
 *
 * Props: None
 *
 * UI Components: Uses shadcn Button for all interactive buttons
 *
 * API Endpoints Used:
 *   - GET /api/next: Fetches the next card to review
 *   - POST /api/answer: Submits whether answer was correct
 *
 * CSS: Uses Tailwind utility classes. Card-flip style with
 *      question on "front" and answer revealed below.
 */

"use client";

import { useState } from "react";
import { apiUrl } from "../lib/api";
import { Button } from "@/components/ui/button";

type StudyState = "idle" | "loading" | "studying" | "revealed" | "empty" | "error";

interface Card {
  id: number;
  question: string;
  answer: string;
}

interface Status {
  state: StudyState;
  message?: string;
}

export default function ViewCard() {
  const [card, setCard] = useState<Card | null>(null);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * fetchNextCard - Fetches the next card from the backend
   *
   * Calls GET /api/next endpoint.
   *
   * Output:
   *   - Updates card state with fetched card, or sets error/empty state
   */
  async function fetchNextCard() {
    setStatus({ state: "loading" });

    try {
      const response = await fetch(apiUrl("/api/next"));

      if (response.status === 400) {
        // No cards in database
        setCard(null);
        setStatus({ state: "empty", message: "No cards to study. Add some cards first!" });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      setCard({
        id: data.id,
        question: data.question,
        answer: data.answer,
      });
      setStatus({ state: "studying" });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Failed to fetch card",
      });
    }
  }

  /**
   * showAnswer - Reveals the answer for the current card
   */
  function showAnswer() {
    setStatus({ state: "revealed" });
  }

  /**
   * submitAnswer - Submits the user's response and fetches next card
   *
   * Calls POST /api/answer with card_id and is_correct.
   *
   * Input:
   *   - isCorrect: boolean - Whether user got the answer correct
   */
  async function submitAnswer(isCorrect: boolean) {
    if (!card) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl("/api/answer"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_id: card.id,
          is_correct: isCorrect,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      // Fetch the next card
      await fetchNextCard();
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Failed to submit answer",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6">
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6">
        Study Cards
      </h1>

      {/* Idle State - Show start button */}
      {status.state === "idle" && (
        <div className="text-center py-8">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Ready to review your flashcards?
          </p>
          <Button onClick={fetchNextCard} size="lg">
            Start Studying
          </Button>
        </div>
      )}

      {/* Loading State */}
      {status.state === "loading" && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading card...</p>
        </div>
      )}

      {/* Empty State - No cards */}
      {status.state === "empty" && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-zinc-600 dark:text-zinc-400">{status.message}</p>
        </div>
      )}

      {/* Error State */}
      {status.state === "error" && (
        <div className="text-center py-8">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-md mb-4">
            <p className="text-red-700 dark:text-red-400">{status.message}</p>
          </div>
          <Button variant="secondary" onClick={fetchNextCard}>
            Try Again
          </Button>
        </div>
      )}

      {/* Studying State - Show question */}
      {(status.state === "studying" || status.state === "revealed") && card && (
        <div className="space-y-6">
          {/* Question */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              Question
            </p>
            <p className="text-lg text-zinc-800 dark:text-zinc-100">
              {card.question}
            </p>
          </div>

          {/* Answer (hidden until revealed) */}
          {status.state === "studying" && (
            <Button variant="secondary" onClick={showAnswer} className="w-full" size="lg">
              Show Answer
            </Button>
          )}

          {/* Answer revealed */}
          {status.state === "revealed" && (
            <>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">
                  Answer
                </p>
                <p className="text-lg text-zinc-800 dark:text-zinc-100">
                  {card.answer}
                </p>
              </div>

              {/* Response buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => submitAnswer(false)}
                  disabled={isSubmitting}
                  className="flex-1 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  size="lg"
                >
                  ✗ Missed it
                </Button>
                <Button
                  variant="outline"
                  onClick={() => submitAnswer(true)}
                  disabled={isSubmitting}
                  className="flex-1 border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                  size="lg"
                >
                  ✓ Got it
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

