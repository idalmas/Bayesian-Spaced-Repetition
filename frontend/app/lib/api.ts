/**
 * api.ts - API Configuration
 *
 * Centralized configuration for backend API communication.
 * Change API_BASE_URL here to update all API calls across the app.
 *
 * Used by: AddCards.tsx, and any future components making API calls
 */

export const API_BASE_URL = "http://localhost:5001";

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

