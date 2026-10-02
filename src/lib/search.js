/**
 * Local, offline search across the embedded program list.
 * Matching runs on normalised (lower-case, accent-stripped) titles, subject
 * names and filenames — nothing leaves the browser and there is no index to
 * build.
 */

/** Lower-case, trim and strip diacritics so "Référence" matches "reference". */
export function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Rank programs for a query.
 *
 * Every whitespace-separated term must appear somewhere in the program's
 * title, subject name or filename (AND semantics, so "page fifo" and
 * "fifo page" both work). Results are ranked: exact title > title prefix >
 * title contains > subject/filename match, then by declaration order.
 *
 * @param {Array<object>} programs
 * @param {Record<string, object>} subjectsById
 * @param {string} query
 * @returns {Array<object>} matching programs, best first
 */
export function searchPrograms(programs, subjectsById, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  const scored = [];
  programs.forEach((program, index) => {
    const subjectName = subjectsById[program.subjectId]
      ? subjectsById[program.subjectId].name
      : '';
    const title = normalizeText(program.title);
    const haystack = [
      title,
      normalizeText(subjectName),
      normalizeText(program.filename || ''),
    ].join(' ');

    if (!terms.every((term) => haystack.includes(term))) return;

    let score = 0;
    if (title === normalizedQuery) score += 100;
    else if (title.startsWith(normalizedQuery)) score += 60;
    else if (title.includes(normalizedQuery)) score += 40;

    for (const term of terms) {
      if (title.startsWith(term)) score += 8;
      if (title.split(/\s+/).includes(term)) score += 6;
    }
    if (normalizeText(subjectName).includes(normalizedQuery)) score += 10;

    scored.push({ program, score, index });
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.map((entry) => entry.program);
}
