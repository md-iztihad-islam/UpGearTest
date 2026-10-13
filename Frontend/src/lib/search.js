// Client-side search used by the dashboard lists. Same rules as the
// storefront search on the backend:
//   - case, accents and punctuation are ignored ("G-502" ≈ "g 502" ≈ "g502")
//   - every word of the query must appear in at least one of the fields,
//     in any order ("logitech black" finds "Black … Logitech")

export const normalizeSearchText = (text) =>
    String(text ?? "")
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();

/**
 * @param {string} query   what the user typed
 * @param {Array<unknown>} fields  values to search in (null/undefined are skipped)
 * @returns {boolean} true when the query is empty or every word matches
 */
export const matchesSearch = (query, fields) => {
    const tokens = normalizeSearchText(query).split(" ").filter(Boolean);
    if (tokens.length === 0) return true;

    const haystack = normalizeSearchText(fields.filter((f) => f !== null && f !== undefined).join(" "));
    const compact = haystack.replace(/ /g, "");
    return tokens.every((token) => haystack.includes(token) || compact.includes(token));
};
