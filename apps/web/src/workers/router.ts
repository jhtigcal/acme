import { getDatesInRange } from "@/lib/dates";
import { honoClient } from "@/lib/hono-client";
import { defineRoute, defineRouter } from "twrpc";
import { z } from "zod";

const router = defineRouter({
  teams: defineRouter({
    list: defineRoute({
      input: z.undefined(),
      handler: async () => {
        const response = await honoClient.api.teams.$get();
        return response.json();
      },
    }),
  }),
  sales: defineRouter({
    list: defineRoute({
      input: z.object({
        teamId: z.string(),
        dateRange: z.object({
          start: z.string(),
          end: z.string(),
        }),
        marketplaces: z.array(z.string()),
      }),
      handler: async ({ input }) => {
        const dates = getDatesInRange({
          start: new Date(input.dateRange.start),
          end: new Date(input.dateRange.end),
        });

        const response = await honoClient.api.teams[`:teamId`].sales.$get({
          param: {
            teamId: input.teamId,
          },
          query: {
            dates,
            marketplaces: input.marketplaces,
          },
        });

        if (response.status === 200) {
          return response.json();
        }

        if (response.status === 204) {
          return [];
        }

        throw new Error(`Failed to fetch sales data: ${response.statusText}`);
      },
    }),
  }),
});

// Also export the router type for use on the client
type Router = typeof router;

export { router };
export type { Router };
