/**
 * add/page.tsx - Add Cards Page
 *
 * Dedicated page for creating new flashcards.
 * Accessible at the /add route.
 *
 * Parent: layout.tsx (root layout)
 * Children: AddCards
 *
 * CSS: Flexbox centering with zinc background, centered card creation form
 */

import AddCards from "../components/AddCards";

export default function AddPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-4">
      <div className="flex flex-col gap-6 w-full max-w-lg">
        <AddCards />
      </div>
    </div>
  );
}

