import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root so Next doesn't guess it from a parent-dir lockfile.
  outputFileTracingRoot: path.resolve(),
};

export default nextConfig;
