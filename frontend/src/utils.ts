export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat("en", options ?? {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value.endsWith("Z") ? value : `${value}Z`));
}

export function daysSince(value: string) {
  const then = new Date(`${value.slice(0, 10)}T12:00:00`).getTime();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - then) / 86_400_000));
}

export function timeAgo(value: string) {
  const days = daysSince(value);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

