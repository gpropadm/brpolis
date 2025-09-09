/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'flowbite.s3.amazonaws.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'avatars.githubusercontent.com'
    ],
  },
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
    EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY,
    EVOLUTION_INSTANCE_NAME: process.env.EVOLUTION_INSTANCE_NAME,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig