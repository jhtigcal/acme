import { DateTime } from "luxon";

export const MARKETPLACES = ["US", "UK", "DE", "JP", "CA"] as const;
export const CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CAD"] as const;
export const START_DATE = DateTime.now().startOf("year").minus({ years: 1 });
export const TODAY = DateTime.now().startOf("day");
