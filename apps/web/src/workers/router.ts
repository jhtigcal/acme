import { getDatesInRange } from "@/lib/dates";
import { db } from "@/lib/db";
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

        // Make the API call to fetch sales data
        // We don't care about the response since we will be fetching it from the IndexDB
        await honoClient.api.teams[`:teamId`].sales.$get({
          param: {
            teamId: input.teamId,
          },
          query: {
            dates,
            marketplaces: input.marketplaces,
          },
        });

        const data = await Promise.all(
          input.marketplaces.map((marketplace) =>
            db.sales
              .where("[teamId+date+marketplace]")
              .between(
                [input.teamId, input.dateRange.start, marketplace],
                [input.teamId, input.dateRange.end, marketplace],
                true,
                true
              )
              .toArray()
          )
        );

        return data.flat();
      },
    }),
  }),
});

// Also export the router type for use on the client
type Router = typeof router;

export { router };
export type { Router };
