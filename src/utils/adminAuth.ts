/**
 * Admin Authentication Utility
 * Provides helper functions to check if a user has admin access
 * Admin access is determined by comparing user email with VITE_ADMIN_EMAIL environment variable
 */

/**
 * Checks if the given email belongs to an admin user
 * @param userEmail - The email address to check
 * @returns true if the email matches the admin email, false otherwise
 */
export const isAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;
  
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.warn('VITE_ADMIN_EMAIL not configured in environment variables');
    return false;
  }
  
  return userEmail.toLowerCase() === adminEmail.toLowerCase();
};

/**
 * Gets the configured admin email (for display purposes only)
 * @returns The admin email or null if not configured
 */
export const getAdminEmail = (): string | null => {
  return import.meta.env.VITE_ADMIN_EMAIL || null;
};
