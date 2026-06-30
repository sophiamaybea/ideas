import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During local dev, proxy /api/* to the local serverless-style backend
// (run `npm run server` in a second terminal).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
