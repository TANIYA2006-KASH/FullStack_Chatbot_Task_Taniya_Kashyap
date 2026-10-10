// Removes HTML tags and control characters from user text.
// React also escapes on output and SQL uses parameterised queries, so this is defence in depth.
export function sanitizeText(value) {
  return String(value)
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

// Escapes % _ \ so user search text is treated literally inside ILIKE.
export function escapeLike(value) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}
