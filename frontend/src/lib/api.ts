/**
 * RainUSE Nexus — Typed API Client
 *
 * All backend communication flows through this module.
 * The base URL is configured via NEXT_PUBLIC_API_URL env variable.
 */

import type {
  BuildingSearchRequest,
  BuildingSearchResponse,
  BuildingResult,
  FilterMetadataResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Search buildings with filters, sorting, and pagination.
 */
export async function searchBuildings(
  req: BuildingSearchRequest
): Promise<BuildingSearchResponse> {
  return request<BuildingSearchResponse>("/api/v1/buildings/search", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

/**
 * Get a single building by ID.
 */
export async function getBuildingById(
  buildingId: string
): Promise<BuildingResult> {
  return request<BuildingResult>(`/api/v1/buildings/${buildingId}`);
}

/**
 * Get available filter options (states, cities, score ranges, etc.).
 */
export async function getFilterMetadata(): Promise<FilterMetadataResponse> {
  return request<FilterMetadataResponse>("/api/v1/filters/metadata");
}

/**
 * Health check.
 */
export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>("/health");
}
