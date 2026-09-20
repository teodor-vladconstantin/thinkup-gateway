import "./instrument";

import * as Sentry from "@sentry/react";
import { PostHogProvider } from "posthog-js/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <PostHogProvider
    apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
    options={{ api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST }}
  >
    <Sentry.ErrorBoundary fallback={<p>Something went wrong.</p>} showDialog>
      <App />
    </Sentry.ErrorBoundary>
  </PostHogProvider>
);
