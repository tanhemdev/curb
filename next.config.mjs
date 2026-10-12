// Static export: the app is plain HTML, CSS and JS that any static host can
// serve. NEXT_PUBLIC_BASE_PATH is set when it lives under a sub-path, like
// GitHub Pages (/curb).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
