/**
 * Utility function to build query strings from parameters.
 * Handles null/undefined values and converts numbers to strings.
 * 
 * @param params - Object with query parameters (null/undefined values are skipped)
 * @returns Query string (with leading "?") or empty string if no params
 */
export function buildQueryString(params: Record<string, any>): string {
  const qs = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      qs.set(key, String(value));
    }
  });
  
  const query = qs.toString();
  return query ? `?${query}` : '';
}
