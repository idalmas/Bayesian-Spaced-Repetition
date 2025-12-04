/**
 * page.tsx - Home Page
 *
 * The main entry page for the Bayesian Spaced Repetition app.
 * Displays:
 *   - shadcn Button (asChild) linking to /add route for creating new cards
 *   - ViewCard: Component for studying/reviewing cards
 *   - MasteryGrid: Visual display of card mastery levels
 *
 * Parent: layout.tsx (root layout)
 * Children: ViewCard, MasteryGrid
 *
 * CSS: Flexbox centering with zinc background, vertical stack of components
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ViewCard from "./components/ViewCard";
import MasteryGrid from "./components/MasteryGrid";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-4">
      <div className="flex flex-col gap-6 w-full max-w-lg">
        <Button asChild size="lg" className="w-full">
          <Link href="/add">+ Add New Card</Link>
        </Button>
        <ViewCard />
        <MasteryGrid />
      </div>
    </div>
  );
}
