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
 * Parent: page.tsx (or any page that needs card review)
 * Children: None
 *
 * Props: None
 *
 * API Endpoints Used:
 *   - GET /api/next: Fetches the next card to review
 *   - POST /api/answer: Submits whether answer was correct
 *
 * Events Dispatched:
 *   - "cardAnswered" (CustomEvent): Fired after submitting an answer, triggers MasteryGrid refresh
 *
 * CSS: Uses Tailwind utility classes. Sharp edges, no shadows.
 *      Question on "front" and answer revealed below.
 */

"use client";

import { useState } from "react";
import { apiUrl } from "../lib/api";

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

      // Dispatch event so MasteryGrid can refresh
      window.dispatchEvent(new CustomEvent("cardAnswered"));

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
    <div className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6">
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6">
        Study Cards
      </h1>

      {/* Idle State - Show start button */}
      {status.state === "idle" && (
        <div className="text-center py-8">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Ready to review your flashcards?
          </p>
          <button
            onClick={fetchNextCard}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Studying
          </button>
        </div>
      )}

      {/* Loading State */}
      {status.state === "loading" && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent animate-spin mb-4" />
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
          <div className="p-4 bg-red-100 dark:bg-red-900/30 mb-4">
            <p className="text-red-700 dark:text-red-400">{status.message}</p>
          </div>
          <button
            onClick={fetchNextCard}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Studying State - Show question */}
      {(status.state === "studying" || status.state === "revealed") && card && (
        <div className="space-y-6">
          {/* Question */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              Question
            </p>
            <p className="text-lg text-zinc-800 dark:text-zinc-100">
              {card.question}
            </p>
          </div>

          {/* Answer (hidden until revealed) */}
          {status.state === "studying" && (
            <button
              onClick={showAnswer}
              className="w-full py-3 px-4 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
            >
              Show Answer
            </button>
          )}

          {/* Answer revealed */}
          {status.state === "revealed" && (
            <>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">
                  Answer
                </p>
                <p className="text-lg text-zinc-800 dark:text-zinc-100">
                  {card.answer}
                </p>
              </div>

              {/* Response buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => submitAnswer(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 text-red-700 dark:text-red-400 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  ✗ Missed it
                </button>
                <button
                  onClick={() => submitAnswer(true)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50 text-green-700 dark:text-green-400 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  ✓ Got it
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

