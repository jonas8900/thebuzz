/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ankerquiz.s3.eu-central-1.amazonaws.com",
        pathname: "/games/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "img-src 'self' data: https:;",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;", 
              "style-src 'self' 'unsafe-inline' https:;",
              "font-src 'self' https: data:;",
              "connect-src 'self' https: wss:;",
              "frame-ancestors 'none';",
            ].join(" "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
