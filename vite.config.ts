import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.RSCFLOW_BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
});
