import { defineRoute, defineRouter } from "twrpc";
import { z } from "zod";

const router = defineRouter({
	teams: defineRouter({
		list: defineRoute({
			input: z.undefined(),
			handler: async ({ ctx }) => {
				const data = await fetch(`${import.meta.env.VITE_BASE_API_URL}/teams`);
				const teams = await data.json();
				return z
					.array(
						z.object({
							id: z.string(),
							name: z.string(),
							marketplaces: z.array(z.string()),
						}),
					)
					.parse(teams);
			},
		}),
	}),
});

// Also export the router type for use on the client
type Router = typeof router;

export { router };
export type { Router };
