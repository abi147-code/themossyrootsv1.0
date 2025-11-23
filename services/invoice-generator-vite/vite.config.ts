import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // required for docker & iframe embedding
    port: 5173,          // stable port
    cors: true,          // allow cross-origin iframe
    strictPort: true,    // fail fast if something else uses 5173
    hmr: {
      overlay: false,    // prevents fullscreen error overlay inside iframe
    },
  },
});
