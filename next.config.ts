import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["nzcc.prettygoodtechsupport.com", "nzcc2.prettygoodtechsupport.com"],
  devIndicators: false,
  // The built-in image optimizer's response cache throws ("LRUCache: calculateSize
  // returned 0") for our static logo assets on this Next.js version, spamming
  // unhandledRejection on every page load. We only serve a handful of pre-sized
  // static PNGs, so there's no need for runtime optimization anyway.
  images: { unoptimized: true },
};

export default nextConfig;
