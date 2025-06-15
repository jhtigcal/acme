import FluviWorker from "./web-worker.ts?worker";

import { createClient } from "twrpc";
import type { Router } from "./router";

// Create a client instance (pass router type as generic)
export const workerClient = createClient<Router>(new FluviWorker());
