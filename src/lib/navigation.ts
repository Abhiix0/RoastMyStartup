/**
 * Navigation utilities for protected routes
 * Centralized logic for handling auth-based redirects
 */

import { isAuthenticated } from "./auth";

/**
 * Get the navigation path for the roast page based on auth state
 * If user is authenticated, returns /roast
 * If not authenticated, returns /auth/login with redirect parameter
 * 
 * @returns Navigation path string
 */
export function getRoastNavigationPath(): string {
  if (isAuthenticated()) {
    return "/roast";
  }
  
  // Not authenticated - redirect to login with intent to return to roast
  return "/auth/login?redirect=/roast";
}

/**
 * Get the navigation path for pricing CTAs based on auth state
 * If user is authenticated, returns /dashboard
 * If not authenticated, returns /auth/login with redirect parameter
 * 
 * @returns Navigation path string
 */
export function getPricingCTAPath(): string {
  if (isAuthenticated()) {
    return "/dashboard";
  }
  
  // Not authenticated - redirect to login
  return "/auth/login";
}

/**
 * Navigate to roast page with auth check
 * This is a helper for programmatic navigation
 * 
 * @param navigate - React Router navigate function
 */
export function navigateToRoast(navigate: (path: string) => void): void {
  const path = getRoastNavigationPath();
  navigate(path);
}

/**
 * Get redirect path from URL query parameters
 * Used after successful authentication to redirect user to intended destination
 * 
 * @param searchParams - URLSearchParams object
 * @param defaultPath - Default path if no redirect parameter exists (default: "/")
 * @returns Path to redirect to
 */
export function getRedirectPath(searchParams: URLSearchParams, defaultPath: string = "/"): string {
  const redirect = searchParams.get("redirect");
  
  // Validate redirect path (must start with / and not be an external URL)
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  
  return defaultPath;
}
