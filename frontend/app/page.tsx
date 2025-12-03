/**
 * page.tsx - Home Page
 *
 * The main entry page for the Bayesian Spaced Repetition app.
 * Displays:
 *   - AddCards: Component for creating new flashcards
 *   - ViewCard: Component for studying/reviewing cards
 *
 * Parent: layout.tsx (root layout)
 * Children: AddCards, ViewCard
 *
 * CSS: Flexbox centering with zinc background, vertical stack of components
 */

import AddCards from "./components/AddCards";
import ViewCard from "./components/ViewCard";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-4">
      <div className="flex flex-col gap-6 w-full max-w-lg">
        <AddCards />
        <ViewCard />
      </div>
    </div>
  );
}
