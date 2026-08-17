import { useEffect } from "react";

const DEFAULT_TITLE = "SampleSeva — Book Lab Tests & Home Sample Collection";

/** Sets the document title per page; falls back to the site default. */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} — SampleSeva` : DEFAULT_TITLE;
  }, [title]);
}
