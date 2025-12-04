/**
 * api.ts - API Configuration
 *
 * Centralized configuration for backend API communication.
 * 
 * In development: Uses localhost:5001 where the Flask backend runs
 * In production (Vercel): Uses relative URLs since frontend and backend
 *                         are served from the same domain
 *
 * Used by: AddCards.tsx, ViewCard.tsx, MasteryGrid.tsx, and any future components
 */

// Use relative URLs in production (Vercel), absolute URLs in development
export const API_BASE_URL = process.env.NODE_ENV === "production" 
  ? "" 
  : "http://localhost:5001";

/**
 * Constructs a full API endpoint URL
 *
 * Input:
 *   - path: string - The API path (e.g., "/api/add_cards")
 *
 * Output:
 *   - string - Full URL (e.g., "http://localhost:5001/api/add_cards")
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

