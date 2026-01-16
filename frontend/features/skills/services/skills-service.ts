import "server-only";

import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import type { Skill } from "@/features/skills/types";

export const skillsService = {
  list: async (options?: { revalidate?: number }): Promise<Skill[]> => {
    try {
      return await apiClient.get<Skill[]>(API_ENDPOINTS.skills, {
        next: { revalidate: options?.revalidate },
      });
    } catch (error) {
      console.warn("[Skills] Failed to fetch skills, using empty list", error);
      return [];
    }
  },
};
