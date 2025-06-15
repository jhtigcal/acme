import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App.tsx";
import "./index.css";

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register(
		import.meta.env.MODE === "production"
			? "/service-worker.js"
			: "/dev-sw.js?dev-sw",
		{ type: import.meta.env.MODE === "production" ? "classic" : "module" },
	);
}

const updateSW = registerSW({
	onNeedRefresh() {
		console.log("New SW available! Asking user to refresh...");
		// Or force reload directly:
		updateSW(true);
	},
	onOfflineReady() {
		console.log("Offline ready");
	},
});

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
