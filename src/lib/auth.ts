/**
 * Authentication utilities
 * Centralized auth state detection and management
 */

/**
 * Check if user is authenticated
 * @returns true if user has a valid auth token
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("auth_token");
  
  if (!token) {
    return false;
  }

  try {
    // Decode JWT to check expiration
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp;
    
    // Check if token is expired
    if (exp && Date.now() >= exp * 1000) {
      // Token expired, clean up
      clearAuthData();
      return false;
    }
    
    return true;
  } catch (error) {
    // Invalid token format
    console.error("Invalid token format:", error);
    clearAuthData();
    return false;
  }
}

/**
 * Get current user info from stored token
 * @returns User info or null if not authenticated
 */
export function getCurrentUser(): { email: string; name: string; roastCount: number } | null {
  if (!isAuthenticated()) {
    return null;
  }

  const email = localStorage.getItem("user_email");
  const name = localStorage.getItem("user_name");
  const roastCount = parseInt(localStorage.getItem("roast_count") || "0", 10);

  if (email && name) {
    return { email, name, roastCount };
  }

  return null;
}

/**
 * Check if user has reached roast limit
 * @returns true if user has used all 6 free roasts
 */
export function hasReachedRoastLimit(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.roastCount >= 6;
}

/**
 * Get remaining roasts for user
 * @returns number of roasts remaining (0-6)
 */
export function getRemainingRoasts(): number {
  const user = getCurrentUser();
  if (!user) return 6;
  return Math.max(0, 6 - user.roastCount);
}

/**
 * Increment roast count (temporary - backend will handle this)
 */
export function incrementRoastCount(): void {
  const user = getCurrentUser();
  if (!user) return;
  
  const newCount = user.roastCount + 1;
  localStorage.setItem("roast_count", newCount.toString());
}

/**
 * Clear all auth data from localStorage
 */
export function clearAuthData(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_name");
  localStorage.removeItem("roast_count");
}

/**
 * Get auth token
 * @returns JWT token or null
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}
