import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const appDir = path.join(root, "app");
const svgPath = path.join(publicDir, "512x512.svg");

const svgBuffer = fs.readFileSync(svgPath);

async function generatePng(size, destPath) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(destPath);
  console.log(`✓ ${path.relative(root, destPath)} (${size}×${size})`);
}

// app/ icons — Next.js picks these up automatically
await generatePng(32,  path.join(appDir, "icon.png"));
await generatePng(180, path.join(appDir, "apple-icon.png"));

// public/ icons — referenced by manifest.json
await generatePng(192, path.join(publicDir, "icon-192.png"));
await generatePng(512, path.join(publicDir, "icon-512.png"));

// Also drop a 32px favicon in public for legacy <link rel="icon"> fallback
await generatePng(32,  path.join(publicDir, "favicon-32.png"));
await generatePng(16,  path.join(publicDir, "favicon-16.png"));

// Write manifest.json
const manifest = {
  name: "Distrett.",
  short_name: "Distrett",
  description: "Malta General Election 2026 — independent candidate guide",
  start_url: "/",
  display: "standalone",
  background_color: "#FFF9F5",
  theme_color: "#FFF9F5",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
};

fs.writeFileSync(
  path.join(publicDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);
console.log("✓ public/manifest.json");

console.log("\nAll done.");
