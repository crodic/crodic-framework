import slugify from 'slugify';

/**
 * Generates the shared ASCII slug format used by user, cosplayer, collection,
 * and post APIs. A maximum length is optional because existing resources use
 * different storage limits.
 */
export function slugifyAscii(text: string, maxLength?: number): string {
  const compatibleInput = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/_/g, ' ')
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/[\s-]+/g, ' ');
  const slug = slugify(compatibleInput, {
    lower: true,
    strict: true,
    trim: true,
  });

  return maxLength === undefined
    ? slug
    : slug.slice(0, maxLength).replace(/-+$/g, '');
}
