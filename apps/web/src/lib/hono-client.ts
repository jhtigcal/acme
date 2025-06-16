import { hc } from "hono/client";
import type { AppRouter } from "../../../core/src/index";

export const honoClient = hc<AppRouter>(import.meta.env.VITE_BASE_API_URL);
