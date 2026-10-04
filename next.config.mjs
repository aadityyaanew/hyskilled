/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/courses',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
