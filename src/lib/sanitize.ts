/**
 * Sanitize HTML strings to only allow safe tags and attributes.
 * Used for translation strings that contain basic formatting.
 */
const ALLOWED_TAGS = ['strong', 'em', 'b', 'i', 'br', 'span'];
const ALLOWED_ATTRS = ['class'];

export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers completely
  let clean = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[\"'][^\"']*[\"']/gi, '');
  clean = clean.replace(/javascript\s*:/gi, '');
  
  // Remove all tags except allowed ones
  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tag) => {
    const tagLower = tag.toLowerCase();
    if (!ALLOWED_TAGS.includes(tagLower)) {
      return ''; // Strip disallowed tags
    }
    // For closing tags, just return them
    if (match.startsWith('</')) {
      return `</${tagLower}>`;
    }
    // For opening tags, only keep allowed attributes
    const attrMatches = match.match(/(\w+)\s*=\s*[\"']([^\"]*)[\"']/g) || [];
    const safeAttrs = attrMatches
      .filter(attr => {
        const attrName = attr.split('=')[0].trim().toLowerCase();
        return ALLOWED_ATTRS.includes(attrName);
      })
      .join(' ');
    return `<${tagLower}${safeAttrs ? ' ' + safeAttrs : ''}>`;
  });
  
  return clean;
}
