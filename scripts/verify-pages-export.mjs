import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "site", "out");
const required = [
  "index.html",
  path.join("deck", "01", "index.html"),
  path.join("deck", "14", "index.html"),
  path.join("specs", "index.html"),
  path.join("whitepaper", "index.html"),
  path.join("research", "index.html"),
  path.join("participate", "index.html")
];

for (const relative of required) {
  const target = path.join(output, relative);
  if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
    throw new Error(`Missing static route: ${relative}`);
  }
}

const home = fs.readFileSync(path.join(output, "index.html"), "utf8");
if (process.env.GITHUB_PAGES === "true" && !home.includes("/card-commons/_next/")) {
  throw new Error("Static assets do not include the GitHub Pages base path.");
}

console.log(`✓ verified ${required.length} static routes`);

