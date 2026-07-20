"use client";

import { useMemo } from "react";
import { createApiClient, createWebTokenStore, createEndpoints } from "@cervical-lens/shared/api";

export function useApiClient(baseUrl: string) {
  return useMemo(() => {
    const client = createApiClient({
      baseUrl,
      tokenStore: createWebTokenStore(),
      onUnauthorized: () => {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },
    });
    const endpoints = createEndpoints(client);
    return { client, ...endpoints };
  }, [baseUrl]);
}
