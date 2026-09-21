/** As páginas continuam usando /api; o destino do proxy é configurado no ambiente. */
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: { "/api": env.API_PROXY_TARGET || "http://127.0.0.1:3000" },
    },
  };
});
