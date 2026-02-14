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
      const jsPath = path.join(outDir, "assets", "index.js");
      const notFoundPath = path.join(outDir, "404.html");
      const cnamePath = path.join(__dirname, "CNAME");
      const cnameDest = path.join(outDir, "CNAME");

      // Inline JS into HTML to avoid MIME type issues (application/octet-stream on some hosts)
      if (fs.existsSync(jsPath) && fs.existsSync(indexPath)) {
        const jsContent = fs.readFileSync(jsPath, "utf-8");
        let html = fs.readFileSync(indexPath, "utf-8");
        html = html.replace(
          /<script[^>]*src="[^"]*\/assets\/index\.js"[^>]*>\s*<\/script>/,
          `<script>${jsContent}</script>`
        );
        fs.writeFileSync(indexPath, html);
        fs.unlinkSync(jsPath); // Remove external file since it's now inlined
      }

      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
      }
      if (fs.existsSync(cnamePath)) {
        fs.copyFileSync(cnamePath, cnameDest);
      }
      fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
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
