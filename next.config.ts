import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    SES_ACCESS_KEY_ID: process.env.SES_ACCESS_KEY_ID ?? "",
    SES_SECRET_ACCESS_KEY: process.env.SES_SECRET_ACCESS_KEY ?? "",
    SES_REGION: process.env.SES_REGION ?? "",
    EMAIL_FROM: process.env.EMAIL_FROM ?? "",
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO ?? "",
  },
};

export default nextConfig;
