/**
 * progress/page.tsx - Progress Page
 *
 * A page showing study progress and mastery levels.
 * Combines the study interface with mastery visualization.
 *
 * Displays:
 *   - ViewCard: Component for studying/reviewing flashcards
 *   - MasteryGrid: Visual display of card mastery levels
 *
 * Parent: layout.tsx (root layout)
 * Children: ViewCard, MasteryGrid
 *
 * CSS: Flexbox centering with zinc background, pt-20 accounts for navbar
 */

import ViewCard from "../components/ViewCard";
import MasteryGrid from "../components/MasteryGrid";

export default function ProgressPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-4 pt-20">
      <div className="flex flex-col gap-6 w-full max-w-lg">
        <ViewCard />
        <MasteryGrid />
      </div>
    </div>
  );
}

