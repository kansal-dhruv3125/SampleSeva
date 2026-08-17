/** Tiny class-name joiner — avoids a dependency for the one thing we need. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
