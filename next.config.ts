import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.78"],
  turbopack: {
    root: rootDir,
  },
  async redirects() {
    return [{ source: "/platform", destination: "/platform/clinics", permanent: false }];
  },
};

export default nextConfig;
