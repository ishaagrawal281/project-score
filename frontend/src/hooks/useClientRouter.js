/**
 * ============================================================================
 *  CLIENT-SIDE ROUTING UTILITY — Custom Router Hook
 * ============================================================================
 *
 *  CONCEPT: Client-Side Routing (Frontend)
 *
 *  Client-side routing enables SPA-like navigation without full page reloads.
 *  Instead of the browser requesting a new HTML document from the server,
 *  JavaScript intercepts navigation events and swaps out components in-place.
 *
 *  HOW NEXT.JS APP ROUTER DOES CLIENT-SIDE ROUTING:
 *
 *  1. FILE-SYSTEM ROUTING: Each file in `app/` directory becomes a route
 *     - app/page.jsx        → /
 *     - app/dashboard/page.jsx → /dashboard
 *     - app/share/[token]/page.jsx → /share/:token (dynamic segment)
 *
 *  2. LINK COMPONENT: <Link href="/dashboard"> intercepts clicks and
 *     uses the History API (pushState/replaceState) instead of full navigation
 *
 *  3. useRouter HOOK: Provides programmatic navigation via router.push(),
 *     router.replace(), router.back(), router.refresh()
 *
 *  4. useSearchParams HOOK: Reads URL query parameters reactively —
 *     when params change, the component re-renders automatically
 *
 *  5. MIDDLEWARE: middleware.ts intercepts requests at the edge for
 *     auth checks, redirects, and access control (runs on the server)
 *
 *  This custom hook wraps Next.js routing primitives into a clean,
 *  reusable API that centralizes all navigation logic.
 *
 * ============================================================================
 */

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';


// ─────────────────────────────────────────────────────────────────────────────
//  ROUTE CONSTANTS — Single source of truth for all app routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Centralized route definitions prevent magic strings scattered across
 * the codebase. If a route path changes, you update it in ONE place.
 *
 * CLIENT-SIDE ROUTING NOTE:
 * These paths map to files in the `app/` directory. Next.js resolves them
 * to React components without making a network request for a new HTML page.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SECURITY: '/security',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',

  /**
   * Dynamic route builder for the share page.
   * Demonstrates dynamic segments: /share/[token]
   *
   * @param {string} token - The share link token
   * @returns {string} The full share URL path
   */
  SHARE: (token) => `/share/${token}`
};


// ─────────────────────────────────────────────────────────────────────────────
//  useClientRouter HOOK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Custom hook that provides a clean API for client-side routing operations.
 *
 * WHY A CUSTOM HOOK?
 * While Next.js provides useRouter and useSearchParams, they are low-level
 * primitives. This hook combines them into a higher-level API that:
 * 1. Centralizes navigation logic
 * 2. Provides URL query parameter management
 * 3. Exposes route constants
 * 4. Adds helper methods for common patterns (updateQueryParams, etc.)
 *
 * BROWSER HISTORY API (under the hood):
 * - router.push()    → window.history.pushState()    → adds to history stack
 * - router.replace() → window.history.replaceState() → replaces current entry
 * - router.back()    → window.history.back()         → pops from history stack
 *
 * @returns {Object} Client-side routing API
 */
export function useClientRouter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  /**
   * Navigate to a route using client-side routing.
   *
   * This pushes a new entry onto the browser's history stack using the
   * History API (pushState). The browser does NOT make a server request —
   * Next.js handles the route change entirely in JavaScript.
   *
   * @param {string} path - Target route path
   */
  const navigateTo = useCallback((path) => {
    router.push(path);
  }, [router]);

  /**
   * Replace the current URL without adding a history entry.
   *
   * Uses replaceState instead of pushState — pressing "Back" won't
   * return to the replaced URL. Useful for filter updates where you
   * don't want each filter change to create a new history entry.
   *
   * @param {string} path - Target route path
   */
  const replaceTo = useCallback((path) => {
    router.replace(path);
  }, [router]);

  /**
   * Update URL query parameters without a full page reload.
   *
   * CLIENT-SIDE ROUTING MECHANISM:
   * 1. Read current search params
   * 2. Merge new params into existing params
   * 3. Use router.replace() to update the URL
   * 4. React re-renders because useSearchParams detects the change
   *
   * This enables filter/sort/pagination state to be stored in the URL,
   * making it shareable and bookmarkable while staying client-side.
   *
   * @param {Object} params - Key-value pairs to set (empty string removes a param)
   * @param {Object} options - Options for navigation behavior
   * @param {boolean} options.replace - If true, replaces history entry (default: true)
   */
  const updateQueryParams = useCallback((params, options = { replace: true }) => {
    const currentParams = new URLSearchParams(searchParams ? searchParams.toString() : '');

    // Merge new params — delete keys with empty/null values
    Object.entries(params).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, String(value));
      }
    });

    const queryString = currentParams.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;

    if (options.replace) {
      router.replace(newPath);
    } else {
      router.push(newPath);
    }
  }, [searchParams, pathname, router]);

  /**
   * Read a single query parameter from the current URL.
   *
   * @param {string} key - The parameter name to read
   * @param {string} defaultValue - Default value if parameter is not present
   * @returns {string} The parameter value or default
   */
  const getQueryParam = useCallback((key, defaultValue = '') => {
    return searchParams?.get(key) || defaultValue;
  }, [searchParams]);

  /**
   * Remove a query parameter from the URL.
   *
   * @param {string} key - The parameter name to remove
   */
  const removeQueryParam = useCallback((key) => {
    updateQueryParams({ [key]: '' });
  }, [updateQueryParams]);

  /**
   * Get all current query parameters as a plain object.
   *
   * @returns {Object} All current URL search parameters
   */
  const allQueryParams = useMemo(() => {
    const params = {};
    if (searchParams) {
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    return params;
  }, [searchParams]);

  /**
   * Navigate back in browser history (client-side).
   * Uses History API's back() method.
   */
  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  /**
   * Check if the current path matches a given route.
   * Useful for active link highlighting.
   *
   * @param {string} path - The route path to check
   * @returns {boolean} True if current path matches
   */
  const isActivePath = useCallback((path) => {
    return pathname === path;
  }, [pathname]);

  return {
    // Navigation methods
    navigateTo,
    replaceTo,
    goBack,

    // Query parameter management
    updateQueryParams,
    getQueryParam,
    removeQueryParam,
    allQueryParams,

    // Route matching
    isActivePath,
    currentPath: pathname,

    // Route constants
    ROUTES
  };
}

export default useClientRouter;
