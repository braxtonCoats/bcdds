import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { copyFileSync, mkdirSync, readdirSync, statSync } from "fs";

// Plugin to copy CSS files to dist/styles after build
const copyCssPlugin = () => {
  return {
    name: "copy-css",
    writeBundle() {
      const srcDir = path.resolve(__dirname, "src");
      const distStylesDir = path.resolve(__dirname, "dist/styles");

      // Create dist/styles directory
      mkdirSync(distStylesDir, { recursive: true });

      // Function to recursively copy CSS files
      const copyCssFiles = (dir: string, relativePath = "") => {
        const entries = readdirSync(dir);

        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip certain directories
            if (
              !entry.includes("node_modules") &&
              !entry.includes(".git") &&
              entry !== "examples" &&
              entry !== "figma" &&
              entry !== "stories"
            ) {
              copyCssFiles(
                fullPath,
                relativePath ? `${relativePath}/${entry}` : entry,
              );
            }
          } else if (entry.endsWith(".css")) {
            // Copy CSS file to dist/styles, preserving directory structure
            const targetDir = relativePath
              ? path.join(distStylesDir, relativePath)
              : distStylesDir;
            mkdirSync(targetDir, { recursive: true });
            const targetPath = path.join(targetDir, entry);
            copyFileSync(fullPath, targetPath);
          }
        }
      };

      copyCssFiles(srcDir);
    },
  };
};

export default defineConfig({
  plugins: [react(), copyCssPlugin()],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        compositions: path.resolve(__dirname, "src/compositions.ts"),
        primitives: path.resolve(__dirname, "src/primitives.ts"),
        layout: path.resolve(__dirname, "src/layout.ts"),
        hooks: path.resolve(__dirname, "src/hooks.ts"),
        utils: path.resolve(__dirname, "src/utils.ts"),
        icons: path.resolve(__dirname, "src/icons.ts"),
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-aria-components",
        "clsx",
      ],
      output: {
        preserveModules: false,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-aria-components": "ReactAriaComponents",
          clsx: "clsx",
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    copyPublicDir: false,
  },
  resolve: {
    alias: {
      compositions: path.resolve(__dirname, "./src/ui/compositions"),
      data: path.resolve(__dirname, "./src/data"),
      hooks: path.resolve(__dirname, "./src/ui/hooks"),
      icons: path.resolve(__dirname, "./src/ui/icons"),
      images: path.resolve(__dirname, "./src/ui/images"),
      layout: path.resolve(__dirname, "./src/ui/layout"),
      primitives: path.resolve(__dirname, "./src/ui/primitives"),
      utils: path.resolve(__dirname, "./src/ui/utils"),
    },
  },
});
