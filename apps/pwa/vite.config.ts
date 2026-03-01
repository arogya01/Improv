import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Improv Practice",
        short_name: "Improv",
        start_url: "/",
        display: "standalone",
        background_color: "#f4f1e8",
        theme_color: "#0d5c63"
      }
    })
  ]
});
