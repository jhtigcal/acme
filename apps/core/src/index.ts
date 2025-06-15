import { faker } from "@faker-js/faker";
import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
	generateCurrencyRates,
	generateProducts,
	generateSalesData,
	generateTeams,
} from "./generators.js";
import { z } from "zod";
import { ZMarketplace } from "./types.js";
import { cors } from "hono/cors";

const app = new Hono();

faker.seed(1234);

// --- FAKE DATA STORAGE ---
const teams = generateTeams();
const products = generateProducts(teams);
const currencyRates = generateCurrencyRates();
const salesData = generateSalesData(teams, products);

app.use(
	cors({
		origin: "http://localhost:5173",
	}),
);

app.get("/api/teams", (c) => {
	return c.json(teams);
});
app.get("/api/exchange-rates", (c) => {
	return c.json(currencyRates);
});
app.get(
	"/api/teams/:teamId/products",
	zValidator("param", z.object({ teamId: z.string() })),
	zValidator(
		"query",
		z.object({
			marketplaces: z.array(ZMarketplace).optional(),
		}),
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
						: marketplaces.includes(product.marketplace)),
			),
		);
	},
);
app.get(
	"/api/teams/:teamId/sales",
	zValidator("param", z.object({ teamId: z.string() })),
	zValidator(
		"query",
		z.object({
			marketplaces: z.array(ZMarketplace).optional(),
			dates: z.array(z.string()),
		}),
	),
	(c) => {
		const { teamId } = c.req.valid("param");
		const { marketplaces, dates } = c.req.valid("query");

		return c.json(
			salesData.filter(
				(item) =>
					item.teamId === teamId &&
					(!marketplaces?.length
						? true
						: marketplaces.includes(item.marketplace)) &&
					dates.includes(item.date),
			),
		);
	},
);

serve(
	{
		fetch: app.fetch,
		port: 3001,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
