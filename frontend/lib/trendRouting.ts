export function getTrendHref(topic: string): string {
  return `/token/${encodeURIComponent(topic)}`;
}
