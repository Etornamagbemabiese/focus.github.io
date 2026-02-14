import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Copy index.html to 404.html for SPA routing + CNAME for custom domain
function ghPagesPlugin() {
  return {
    name: "gh-pages",
    transformIndexHtml(html: string) {
      // IIFE build: remove type="module" to avoid MIME type strictness (application/octet-stream)
      return html.replace(/\s+type="module"/g, "");
    },
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist");
      const indexPath = path.join(outDir, "index.html");
      const notFoundPath = path.join(outDir, "404.html");
      const cnamePath = path.join(__dirname, "CNAME");
      const cnameDest = path.join(outDir, "CNAME");
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
      }
      if (fs.existsSync(cnamePath)) {
        fs.copyFileSync(cnamePath, cnameDest);
      }
      // .nojekyll prevents GitHub Pages from processing with Jekyll (can affect MIME types)
      fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
      // _headers for Netlify/Cloudflare Pages - force correct MIME type for JS (fixes application/octet-stream)
      const headersPath = path.join(outDir, "_headers");
      fs.writeFileSync(
        headersPath,
        "/assets/*.js\n  Content-Type: application/javascript\n  X-Content-Type-Options: nosniff\n\n/assets/*.css\n  Content-Type: text/css\n  X-Content-Type-Options: nosniff\n"
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  build: {
    rollupOptions: {
      output: {
        format: "iife",
        name: "FocusApp",
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && ghPagesPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
