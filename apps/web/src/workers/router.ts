import { getDatesInRange } from "@/lib/dates";
import { db } from "@/lib/db";
import { honoClient } from "@/lib/hono-client";
import { defineRoute, defineRouter } from "twrpc";
import { z } from "zod";

async function handleSalesList({
  input,
}: {
  input: {
    teamId: string;
    dateRange: { start: string; end: string };
    marketplaces: string[];
  };
}) {
  const dates = getDatesInRange({
    start: new Date(input.dateRange.start),
    end: new Date(input.dateRange.end),
  });
  // Make the API call to fetch sales data
  // We don't care about the response since we will be fetching it from the IndexDB
  await honoClient.api.teams[":teamId"].sales.$get({
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
}

async function handleProductsRecord({
  input,
}: {
  input: { teamId: string; marketplaces: string[] };
}) {
  // Make the API call to fetch products
  // We don't care about the response since we will be fetching it from the IndexDB
  await honoClient.api.teams[":teamId"].products.$get({
    param: {
      teamId: input.teamId,
    },
    query: {
      marketplaces: input.marketplaces,
    },
  });

  // Fetch products from the IndexedDB
  const products = await db.products
    .where("[teamId+marketplace]")
    .anyOf(input.marketplaces.map((m) => [input.teamId, m]))
    .toArray();

  const productRecord: Record<string, (typeof products)[number]> = {};

  for (const product of products) {
    productRecord[product.id] = product;
  }

  return productRecord;
}

async function handleExchangeRatesRecord({
  input,
}: {
  input: { dateRange: { start: string; end: string } };
}) {
  const dates = getDatesInRange({
    start: new Date(input.dateRange.start),
    end: new Date(input.dateRange.end),
  });

  // Make the API call to fetch exchange rates
  // We don't care about the response since we will be fetching it from the IndexDB
  await honoClient.api["exchange-rates"].$get({
    query: {
      dates,
    },
  });

  // Fetch exchange rates from the IndexedDB
  const exchangeRates = await db.exchangeRates
    .where("date")
    .between(input.dateRange.start, input.dateRange.end, true, true)
    .toArray();

  const exchangeRateRecord: Record<string, (typeof exchangeRates)[number]> = {};

  for (const rate of exchangeRates) {
    exchangeRateRecord[rate.date] = rate;
  }

  return exchangeRateRecord;
}

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
      handler: handleSalesList,
    }),
  }),
  products: defineRouter({
    list: defineRoute({
      input: z.object({
        teamId: z.string(),
        marketplaces: z.string().array(),
      }),
      handler: async ({ input }) => {
        // Make the API call to fetch products
        // We don't care about the response since we will be fetching it from the IndexDB
        await honoClient.api.teams[`:teamId`].products.$get({
          param: {
            teamId: input.teamId,
          },
          query: {
            marketplaces: input.marketplaces,
          },
        });

        // Fetch products from the IndexedDB
        const products = db.products
          .where("[teamId+marketplace]")
          .anyOf(input.marketplaces.map((m) => [input.teamId, m]))
          .toArray();

        return products;
      },
    }),
    record: defineRoute({
      input: z.object({
        teamId: z.string(),
        marketplaces: z.string().array(),
      }),
      handler: handleProductsRecord,
    }),
  }),
  exchangeRates: defineRouter({
    list: defineRoute({
      input: z.object({
        dateRange: z.object({
          start: z.string(),
          end: z.string(),
        }),
      }),
      handler: async ({ input }) => {
        const dates = getDatesInRange({
          start: new Date(input.dateRange.start),
          end: new Date(input.dateRange.end),
        });
        // Make the API call to fetch exchange rates
        // We don't care about the response since we will be fetching it from the IndexDB
        await honoClient.api["exchange-rates"].$get({
          query: {
            dates,
          },
        });

        // Fetch exchange rates from the IndexedDB
        const exchangeRates = db.exchangeRates
          .where("date")
          .between(input.dateRange.start, input.dateRange.end, true, true)
          .toArray();

        return exchangeRates;
      },
    }),
    record: defineRoute({
      input: z.object({
        dateRange: z.object({
          start: z.string(),
          end: z.string(),
        }),
      }),
      handler: handleExchangeRatesRecord,
    }),
  }),

  // dashboard
  dashboard: defineRouter({
    // Revenue Profit Expenses Units Sold
    stats: defineRoute({
      input: z.object({
        teamId: z.string(),
        dateRange: z.object({
          start: z.string(),
          end: z.string(),
        }),
        marketplaces: z.array(z.string()),
      }),
      handler: async ({ input }) => {
        const sales = await handleSalesList({
          input: {
            teamId: input.teamId,
            dateRange: {
              start: input.dateRange.start,
              end: input.dateRange.end,
            },
            marketplaces: input.marketplaces,
          },
        });
        const products = await handleProductsRecord({
          input: {
            teamId: input.teamId,
            marketplaces: input.marketplaces,
          },
        });
        const exchangeRates = await handleExchangeRatesRecord({
          input: {
            dateRange: {
              start: input.dateRange.start,
              end: input.dateRange.end,
            },
          },
        });

        const stats = {
          revenue: 0,
          profit: 0,
          expenses: 0,
          unitsSold: 0,
        };

        for (const sale of sales) {
          const product = products[sale.productId];
          const exchangeRate = exchangeRates[sale.date];

          if (!product || !exchangeRate) continue;

          const revenueInUSD =
            sale.revenue / (exchangeRate.rates[product.currency] ?? 1);
          const costInUSD =
            product.productionCost /
            (exchangeRate.rates[product.currency] ?? 1);

          stats.revenue += revenueInUSD;
          stats.profit += (revenueInUSD - costInUSD) * sale.unitsSold;
          stats.expenses += costInUSD * sale.unitsSold;
          stats.unitsSold += sale.unitsSold;
        }

        return stats;
      },
    }),
  }),
});

// Also export the router type for use on the client
type Router = typeof router;

export { router };
export type { Router };
