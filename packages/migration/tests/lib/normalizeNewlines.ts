/**
 * Normalizes the new line characters.
 * Converts CRLF to LF.
 *
 * Used to compare file contents, or in snapshot testing.
 */
export const normalizeNewlines = (str: string): string => {
  return str.replace(/\r\n/g, '\n')
}
