import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split the previously monolithic 1.2MB vendor chunk into logical
          // groups so the browser can cache and load them independently.
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "@chakra-ui/react",
            "@emotion/react",
            "@emotion/styled",
            "framer-motion",
          ],
          "chart-vendor": ["recharts"],
          "web3-vendor": ["ethers"],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
