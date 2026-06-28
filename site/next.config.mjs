import createMDX from "@next/mdx";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "card-commons";
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? `/${repository}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: []
  }
});

export default withMDX(nextConfig);

