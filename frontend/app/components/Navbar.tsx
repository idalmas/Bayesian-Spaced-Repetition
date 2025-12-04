/**
 * Navbar.tsx - Main Navigation Component
 *
 * A navigation bar for the Bayesian Spaced Repetition app.
 * Provides links to the three main sections:
 *   - Study (/): Main studying interface
 *   - Add Cards (/add): Create new flashcards
 *   - Progress (/progress): View mastery grid and study stats
 *
 * Parent: layout.tsx (root layout)
 * Children: None
 *
 * UI Components: Uses shadcn NavigationMenu for navigation links
 *
 * CSS: Fixed top navbar with centered navigation links.
 *      Uses shadcn theming for consistent styling.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Study" },
    { href: "/add", label: "Add Cards" },
    { href: "/progress", label: "Progress" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-center px-4">
        <NavigationMenu>
          <NavigationMenuList className="gap-1">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}

