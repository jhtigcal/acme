/// <reference lib="webworker" />

import { createHandler } from "twrpc";
import { router } from "./router";

// Create an instance of twrpc app
const twrpc = createHandler(router);

// Handle message events
self.onmessage = async (message) => {
	const response = await twrpc.handleMessage({
		message,
		ctx: {}, // You can pass in any context you want here and will be available in your handlers
	});
	self.postMessage(response);
};
