/**
 * progress/page.tsx - Progress Page
 *
 * A page showing study progress and mastery levels.
 * Combines the study interface with mastery visualization.
 *
 * Displays:
 *   - ViewCard: Component for studying/reviewing flashcards
 *   - MasteryGrid: Visual display of card mastery levels (wider container)
 *
 * Live Updates:
 *   - When a card answer is submitted in ViewCard, the MasteryGrid
 *     automatically refreshes to show updated mastery values.
 *
 * Parent: layout.tsx (root layout)
 * Children: ViewCard, MasteryGrid
 *
 * CSS: Flexbox centering with zinc background, pt-20 accounts for navbar.
 *      Uses max-w-4xl for wider MasteryGrid display.
 */

"use client";

import { useRef } from "react";
import ViewCard from "../components/ViewCard";
import MasteryGrid, { MasteryGridRef } from "../components/MasteryGrid";

export default function ProgressPage() {
  const masteryGridRef = useRef<MasteryGridRef>(null);

  /**
   * handleAnswerSubmit - Called when user submits an answer in ViewCard
   * Triggers a refresh of the MasteryGrid to show live updates.
   */
  function handleAnswerSubmit() {
    masteryGridRef.current?.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-4 pt-20">
      <div className="flex flex-col gap-6 w-full max-w-4xl">
        <ViewCard onAnswerSubmit={handleAnswerSubmit} />
        <MasteryGrid ref={masteryGridRef} />
      </div>
    </div>
  );
}

