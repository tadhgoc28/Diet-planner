"use client";

import { useEffect } from "react";

/**
 * Sets the browser tab title from client state.
 *
 * The recipe detail and edit pages are client rendered because their data lives
 * in localStorage, so Next cannot build metadata for them on the server. Those
 * pages call this once the record has loaded. Pass null while loading to leave
 * the inherited title in place.
 *
 * There is no cleanup on unmount on purpose: every other route exports its own
 * `metadata`, so the App Router sets the correct title on navigation. Restoring
 * a captured previous value here would risk overwriting it.
 */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
