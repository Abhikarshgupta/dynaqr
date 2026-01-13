/**
 * Generate a random alphanumeric slug
 */
export function generateSlug(length: number = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): boolean {
  // Alphanumeric and hyphens only, lowercase
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 50;
}

/**
 * Normalize slug (lowercase, trim, replace spaces with hyphens)
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}