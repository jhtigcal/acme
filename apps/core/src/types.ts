import { z } from "zod";
import { CURRENCIES, MARKETPLACES } from "./constants.js";

export const ZMarketplace = z.enum(MARKETPLACES);
export type IMarketplace = z.infer<typeof ZMarketplace>;

export const ZCurrency = z.enum(CURRENCIES);
export type ICurrency = z.infer<typeof ZCurrency>;

export const ZTeam = z.object({
  id: z.string(),
  name: z.string(),
  marketplaces: z.array(ZMarketplace),
});
export type ITeam = z.infer<typeof ZTeam>;

export const ZProduct = z.object({
  id: z.string(),
  teamId: z.string(),
  marketplace: ZMarketplace,
  asin: z.string(),
  name: z.string(),
  productionCost: z.number(),
  currency: ZCurrency,
  price: z.number(),
});
export type IProduct = z.infer<typeof ZProduct>;

export const ZExchangeRate = z.object({
  date: z.string(),
  rates: z.record(ZCurrency, z.number()),
});
export type IExchangeRate = z.infer<typeof ZExchangeRate>;

export const ZSalesDataItem = z.object({
  teamId: z.string(),
  marketplace: ZMarketplace,
  date: z.string(),
  productId: z.string(),
  unitsSold: z.number(),
  revenue: z.number(),
  currency: ZCurrency,
});
export type ISalesDataItem = z.infer<typeof ZSalesDataItem>;
