export function normalizeEmail(input = "") {
  return input
    .toString()
    .normalize("NFKC")
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "") 
    .toLowerCase();
}