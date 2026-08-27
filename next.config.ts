import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Recipe images can be pasted in as arbitrary URLs by the user, so we allow
    // any HTTPS host. For a shared/production deployment you'd narrow this down.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
