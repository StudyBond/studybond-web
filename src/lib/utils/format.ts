const integerFormatter = new Intl.NumberFormat("en-NG");
const compactFormatter = new Intl.NumberFormat("en-NG", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatInteger(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  return integerFormatter.format(value);
}

export function formatCompact(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  return compactFormatter.format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0%";
  }

  return `${Math.round(value)}%`;
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return "Unavailable";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(date);
}
