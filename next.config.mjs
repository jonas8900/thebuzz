/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "ankerquiz.s3.eu-central-1.amazonaws.com",
            pathname: "/games/**",
          },
        ],
      },

};

export default nextConfig;
