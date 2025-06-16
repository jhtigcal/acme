import { faker } from "@faker-js/faker";
import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import {
  generateCurrencyRates,
  generateProducts,
  generateSalesData,
  generateTeams,
} from "./generators.js";

const app = new Hono();

faker.seed(1234);

// --- FAKE DATA STORAGE ---
const teams = generateTeams();
const products = generateProducts(teams);
const currencyRates = generateCurrencyRates();
const salesData = generateSalesData(teams, products);

const ZStringArray = z.union([
  z.string().transform((val) => [val]),
  z.string().array(),
]);

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

const route = app
  .get("/api/teams", (c) => {
    return c.json(teams);
  })
  .get("/api/exchange-rates", (c) => {
    return c.json(currencyRates);
  })
  .get(
    "/api/teams/:teamId/products",
    zValidator("param", z.object({ teamId: z.string() })),
    zValidator(
      "query",
      z.object({
        marketplaces: ZStringArray,
      })
    ),
    (c) => {
      const { teamId } = c.req.valid("param");
      const { marketplaces } = c.req.valid("query");

      return c.json(
        products.filter(
          (product) =>
            product.teamId === teamId &&
            (!marketplaces?.length
              ? true
              : marketplaces.includes(product.marketplace))
        )
      );
    }
  )
  .get(
    "/api/teams/:teamId/sales",
    zValidator("param", z.object({ teamId: z.string() })),
    zValidator(
      "query",
      z.object({
        marketplaces: ZStringArray,
        dates: ZStringArray,
      })
    ),
    (c) => {
      const { teamId } = c.req.valid("param");
      const { marketplaces, dates } = c.req.valid("query");

      return c.json(
        salesData.filter((item) => {
          return (
            item.teamId === teamId &&
            (!marketplaces?.length
              ? true
              : marketplaces.includes(item.marketplace)) &&
            dates.includes(item.date)
          );
        })
      );
    }
  );

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

export type AppRouter = typeof route;
