"use client";

import { apiFetch } from "@/lib/api";

/** Default SWR fetcher — GET JSON via our ApiError-aware helper. */
export const swrFetcher = <T,>(url: string) => apiFetch<T>(url);
