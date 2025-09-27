import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/goong": {
        target: "https://maps.goong.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/goong/, ""),
      },
    },
  },
});
