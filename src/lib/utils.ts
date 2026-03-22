/**
 * Format price in 万円 (10,000 yen units)
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "価格未定";
  return `${price.toLocaleString()}万円`;
}

/**
 * Format area in m²
 */
export function formatArea(area: number | null | undefined): string {
  if (area == null) return "-";
  return `${area.toFixed(2)}㎡`;
}

/**
 * Format price per tsubo
 */
export function formatPricePerTsubo(price: number | null | undefined): string {
  if (price == null) return "-";
  return `${price.toLocaleString()}万円/坪`;
}

/**
 * Format built year/month string
 */
export function formatBuiltYearMonth(ym: string | null | undefined): string {
  if (!ym) return "-";
  const parts = ym.split("-");
  if (parts.length === 2) {
    return `${parts[0]}年${parseInt(parts[1], 10)}月`;
  }
  return ym;
}

/**
 * Format contract year/month
 */
export function formatContractYearMonth(ym: string | null | undefined): string {
  if (!ym) return "-";
  const parts = ym.split("-");
  if (parts.length === 2) {
    return `${parts[0]}年${parseInt(parts[1], 10)}月`;
  }
  return ym;
}

/**
 * Format age years
 */
export function formatAgeYears(years: number | null | undefined): string {
  if (years == null) return "-";
  if (years === 0) return "新築";
  return `築${years}年`;
}

/**
 * Format boolean for display
 */
export function formatBoolean(value: boolean | null | undefined): string {
  if (value == null) return "-";
  return value ? "あり" : "なし";
}

/**
 * Format management fee
 */
export function formatFee(fee: number | null | undefined): string {
  if (fee == null) return "-";
  return `${fee.toLocaleString()}円/月`;
}

/**
 * Format floor number
 */
export function formatFloor(floor: number | null | undefined): string {
  if (floor == null) return "-";
  return `${floor}階`;
}

/**
 * Format price range (for transactions)
 */
export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined
): string {
  if (min == null && max == null) return "価格未公開";
  if (min == null) return `〜${max?.toLocaleString()}万円`;
  if (max == null) return `${min.toLocaleString()}万円〜`;
  if (min === max) return `${min.toLocaleString()}万円`;
  return `${min.toLocaleString()}〜${max.toLocaleString()}万円`;
}

/**
 * Generate slug from Japanese text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s　]+/g, "-")
    .replace(/[^\w\-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Normalize text for search (remove spaces, lowercase)
 */
export function normalizeText(text: string): string {
  return text
    .replace(/[\s　]+/g, "")
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    );
}

/**
 * Parse CSV line respecting quoted fields
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}
